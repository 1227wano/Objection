# load_precedents.py
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StringType
import json

# 1. SparkSession 초기화 (YARN 클러스터용)
spark = (SparkSession.builder
    .appName("PrecedentDataPipeline")
    # 서버2에 postgresql jar 파일이 다운로드 되어 있어야함
    .config("spark.jars", "/app/postgresql-42.7.2.jar") 
    .getOrCreate())

print("=== Spark Cluster 세팅 완료 ===")


# 2. Hadoop(HDFS)에서 JSONL 데이터 읽어오기
# 노드 갯수를 신경 쓸 필요 없이, 폴더 경로만 주면 분산된 데이터를 알아서 다 수집
hdfs_path = "hdfs://hadoop-namenode:8020/input/refined/*.jsonl"
print(f"=== HDFS에서 데이터 읽는 중: {hdfs_path} ===")

# .json()으로 읽으면 JSONL(줄바꿈으로 구분된 JSON)을 레코드별로 아주 잘 읽어옵니다.
df = spark.read.json(hdfs_path)


# ==========================================
# 3. AI API 호출 로직 및 커스텀 UDF 등록
# ==========================================
def get_ai_embedding(text):
    if not text or len(str(text).strip()) == 0:
        return "[0.0]"
        
    import requests
    import time
    
    url = "https://j14a102a.p.ssafy.io/ai/agents/text-embedding"
    headers = {"Content-Type": "application/json"}
    
    # 🔥 대수술 부위: 텍스트가 아무리 길어도 무조건 앞의 2000자만 자릅니다!
    safe_text = str(text)[:2000] 
    payload = {"text": safe_text}
    
    max_retries = 3 
    last_error = "알 수 없는 에러"
    
    for attempt in range(max_retries):
        try:
            time.sleep(1.0) 
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "SUCCESS" and "result" in data:
                    embedding_list = data["result"].get("embedding")
                    if embedding_list:
                        return str(embedding_list)
            
            last_error = f"HTTP 상태코드: {response.status_code}, 응답내용: {response.text}"
            
        except Exception as e:
            last_error = f"요청 실패: {str(e)}"
            
        time.sleep(3) 
        continue
        
    raise Exception(f"AI API 최종 실패! 원인: {last_error} / 텍스트: {safe_text[:20]}")

def get_ai_summary(text):
    return "AI가 생성한 가짜 판례 요약본입니다."

def get_case_suffix(case_name):
    """사건명에서 판결 결과를 추출하여 꼬리표(-숫자)를 달아주는 함수"""
    if not case_name:
        return "-9"
        
    import re
    # 정규식 설명: 맨 마지막 ']' 기호 바로 앞에 있는 단어(공백이나 쉼표가 아닌 문자열)를 추출합니다.
    match = re.search(r'([^,\s]+)\s*\]\s*$', str(case_name))
    
    if match:
        word = match.group(1).strip()
        if word in ['각하', '파기']:
            return "-0"
        elif word in ['인용', '일부인용', '감경']:
            return "-1"
        elif word in ['기각']:
            return "-2"
        else:
            return "-9" # 기타, 날짜, 숫자인 경우
    
    return "-9" # ']' 로 끝나지 않는 예외적인 경우

# UDF 등록
embed_udf = F.udf(get_ai_embedding, StringType())
summary_udf = F.udf(get_ai_summary, StringType())
suffix_udf = F.udf(get_case_suffix, StringType())


# ==========================================
# 4. 데이터 Parsing 및 분리 (부모 & 자식)
# ==========================================
print("=== 데이터 분리 및 새로운 사건번호(PK) 생성 시작 ===")

# 원본 DataFrame에 새로운 사건번호 컬럼을 미리 만들어 둡니다.
# 사건번호 + suffix_udf 결과값 (예: "2013-00520" + "-2" => "2013-00520-2")
df_with_pk = df.withColumn(
    "new_precedent_no", 
    F.concat(F.col("사건번호"), suffix_udf(F.col("사건명")))
)

# 판례 테이블용 DataFrame 생성
parent_df = (
    df_with_pk
    .select(
        F.col("new_precedent_no").alias("precedent_no"),
        F.col("사건명").alias("precedent_name"),
        F.col("판례종류").alias("precedent_code"),
        F.col("의결일자").alias("precedent_date"),
        F.current_timestamp().alias("created_at")
    )
    # 만약 완전히 똑같은 데이터(사건명까지 100% 일치)가 중복 수집되었을 경우를 대비한 최종 안전장치
    .dropDuplicates(["precedent_no"]) 
)

# 판례 벡터 테이블용 DataFrame 생성
child_df = (
    df_with_pk
    .withColumn(
        "combined_text", 
        F.concat_ws("\n", 
            F.col("사건명"), 
            F.col("주문"), 
            F.col("청구취지"), 
            F.col("재결요지"),
            F.col("이유")
        )
    )
    .withColumn("vector_text", F.col("combined_text"))
    .withColumn("vector_data", embed_udf(F.col("combined_text")))
    .withColumn("vector_summary", summary_udf(F.col("combined_text")))
    .withColumn("created_at", F.current_timestamp())
    .withColumn("updated_at", F.current_timestamp())
    .select(
        F.col("new_precedent_no").alias("precedent_no"),
        "vector_text",
        "vector_summary",
        "vector_data",
        "created_at",
        "updated_at"
    )
    # 자식 테이블도 마찬가지로 완벽한 중복 방지
    .dropDuplicates(["precedent_no"])
)


# ==========================================
# 5. PostgreSQL DB(서버1)에 최종 적재 (순서 보장!)
# ==========================================
db_url = "jdbc:postgresql://j14a102.p.ssafy.io:5432/objection"
db_properties = {
    "user": "ssafy", 
    "password": "ssafy", 
    "driver": "org.postgresql.Driver",
    "stringtype": "unspecified" # pgvector 필수 옵션
}

print("=== DB로 데이터 전송 시작... ===")

# 무조건 부모 테이블(precedents)부터 저장해야 합니다!
print("-> 1. 부모 테이블(precedents) 적재 중...")
parent_df.write.jdbc(url=db_url, table="precedents", mode="append", properties=db_properties)
print("-> 부모 테이블 적재 완료!")

# 부모가 저장된 후 자식 테이블(precedent_vectors) 저장
print("-> 2. 자식 테이블(precedent_vectors) 적재 중 (AI API 호출 포함)...")
child_df.write.jdbc(url=db_url, table="precedent_vectors", mode="append", properties=db_properties)
print("-> 자식 테이블 적재 완료!")

print("=== 전체 DB 파이프라인 적재 완벽 성공! ===")