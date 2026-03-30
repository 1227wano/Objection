from pyspark.sql import SparkSession
import psycopg2 

# 1. Spark 초기화
spark = SparkSession.builder \
    .appName("UpdateAllPrecedentSummaries") \
    .config("spark.jars", "/app/postgresql-42.7.2.jar") \
    .getOrCreate()

# 2. AI 요약 API 호출 함수 (뼈대)
def get_ai_summary(text):
    if not text or len(str(text).strip()) == 0:
        return None
        
    import requests
    url = "https://j14a102a.p.ssafy.io/ai/agents/text-summary" # 실제 요약 API 주소로 변경
    headers = {"Content-Type": "application/json"}
    safe_text = str(text)[:2000] 
    payload = {"text": safe_text}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "SUCCESS" and "result" in data:
                return data["result"].get("summary")
        return None
    except Exception as e:
        return None

# 3. 분산 UPDATE 함수
def update_db_partition(iterator):
    conn = psycopg2.connect(
        host="j14a102.p.ssafy.io", 
        dbname="objection", 
        user="ssafy", 
        password="ssafy", 
        port=5432
    )
    cur = conn.cursor()
    
    for row in iterator:
        # DB에서 가져온 전체 원문(vector_text)을 요약 API로 전송
        real_summary = get_ai_summary(row.vector_text)
        
        if real_summary:
            update_query = """
                UPDATE precedent_vectors 
                SET vector_summary = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE precedent_no = %s
            """
            cur.execute(update_query, (real_summary, row.precedent_no))
            
    conn.commit()
    cur.close()
    conn.close()

# 4. 실행 로직 (전체 데이터 가져오기)
print("=== DB에서 전체 판례 데이터 읽어오기 ===")
# WHERE 조건 없이 전체 데이터를 가져옵니다.
df_all = spark.read.format("jdbc") \
    .option("url", "jdbc:postgresql://j14a102.p.ssafy.io:5432/objection") \
    .option("dbtable", "(SELECT precedent_no, vector_text FROM precedent_vectors) as tmp") \
    .option("user", "ssafy") \
    .option("password", "ssafy") \
    .option("driver", "org.postgresql.Driver") \
    .load()

print(f"=== 총 업데이트 대상 건수: {df_all.count()}건 ===")
print("=== 분산 UPDATE 작업 시작 (API 호출로 인해 시간이 소요될 수 있습니다) ===")

df_all.foreachPartition(update_db_partition)

print("=== 🎉 모든 판례 요약본 UPDATE 완벽 성공! ===")