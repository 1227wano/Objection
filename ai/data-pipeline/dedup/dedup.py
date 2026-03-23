"""
중복 제거 스크립트 (PySpark + YARN)
사용법: python3 /app/dedup/dedup.py

정석 방식: Spark가 폴더 단위로 저장. 폴더 = 하나의 데이터셋.
읽을 때는 spark.read.json("/deduped/") 로 폴더 안의 모든 part 파일을 자동으로 읽음.

흐름:
- 첫 실행 (/deduped/ 비어있음): /raw/precedents/ + /raw/new/ 전부 로드 → 중복 제거 → /deduped/init/
- 이후 실행: /raw/new/만 로드 → 기존 /deduped/와 비교 → 신규분만 /deduped/batch_날짜/
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, "/app")
from common.hdfs_utils import hdfs_mkdir, hdfs_ls, hdfs_exists, generate_filename

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window


def get_spark():
    """YARN 연결된 SparkSession 생성"""
    return SparkSession.builder \
        .appName("DedupPipeline") \
        .master("yarn") \
        .config("spark.submit.deployMode", "client") \
        .getOrCreate()


def has_jsonl_files(hdfs_path: str) -> bool:
    """HDFS 경로에 .jsonl 파일이 있는지 확인"""
    if not hdfs_exists(hdfs_path):
        return False
    files = hdfs_ls(hdfs_path)
    return any(f.endswith(".jsonl") or f.endswith(".json") for f in files)


def has_deduped_data(hdfs_path: str) -> bool:
    """HDFS /deduped/ 에 데이터가 있는지 확인 (하위 폴더 포함)"""
    if not hdfs_exists(hdfs_path):
        return False
    files = hdfs_ls(hdfs_path)
    # init/ 이나 batch_날짜/ 하위 폴더가 있으면 데이터 있음
    return len(files) > 0


def clean_columns(df):
    """사건번호 공백 제거 + 의결일자 뒤 점 제거"""
    return df \
        .withColumn("사건번호", F.regexp_replace(F.trim(F.col("사건번호")), r"\s+", "")) \
        .withColumn("의결일자", F.trim(F.regexp_replace("의결일자", r"\.$", "")))


def main():
    print("=" * 60)
    print(f"중복 제거 시작 (PySpark + YARN): {datetime.now()}")
    print("=" * 60)

    hdfs_mkdir("/deduped")

    # 1. 첫 실행 여부 판별
    is_first_run = not has_deduped_data("/deduped")
    print(f"\n[1/4] 첫 실행 여부: {'첫 실행 (과거 + 신규 전부)' if is_first_run else '이후 실행 (신규만)'}")

    # 2. Spark 세션 생성
    print("\n[2/4] Spark 세션 생성 중...")
    spark = get_spark()
    spark.sparkContext.setLogLevel("WARN")
    print(f"  Spark version: {spark.version}")

    try:
        # 3. 데이터 로드 + 중복 제거
        print("\n[3/4] 데이터 로드 중...")

        if is_first_run:
            # 과거 + 신규 전부 로드
            paths = []
            if has_jsonl_files("/raw/precedents"):
                paths.append("hdfs:///raw/precedents/*.jsonl")
                print("  과거 데이터 로드: /raw/precedents/")
            if has_jsonl_files("/raw/new"):
                paths.append("hdfs:///raw/new/*.jsonl")
                print("  신규 데이터 로드: /raw/new/")

            if not paths:
                print("  원본 데이터 없음. 종료.")
                return

            df_raw = spark.read.json(paths)
            total = df_raw.count()
            print(f"  전체 로드: {total}건")

            # 사건번호 공백 제거 + 의결일자 정리
            df_raw = clean_columns(df_raw)

            # Window로 중복 제거 (사건번호 + 의결일자 기준, 1건 유지)
            window = Window.partitionBy("사건번호", "의결일자").orderBy("사건번호")
            df_numbered = df_raw.withColumn("_rn", F.row_number().over(window))
            df_deduped = df_numbered.filter(F.col("_rn") == 1).drop("_rn")

            deduped_count = df_deduped.count()
            removed = total - deduped_count
            print(f"  원본: {total}건 → 중복 제거: {removed}건 → 최종: {deduped_count}건")

            # /deduped/init/ 에 폴더 단위로 저장
            output_path = "hdfs:///deduped/init"
            df_deduped.write.mode("overwrite").json(output_path)
            print(f"\n[4/4] 저장 완료! {deduped_count}건 → /deduped/init/")

        else:
            # 신규만 로드 + 기존 deduped와 비교
            if not has_jsonl_files("/raw/new"):
                print("  신규 데이터 없음. 종료.")
                return

            df_new = spark.read.json("hdfs:///raw/new/*.jsonl")
            new_count = df_new.count()
            print(f"  신규 데이터: {new_count}건")

            # 기존 deduped 전체 읽기 (하위 폴더 포함)
            df_existing = spark.read.json("hdfs:///deduped/*/")
            existing_count = df_existing.count()
            print(f"  기존 deduped: {existing_count}건")

            # 사건번호 공백 제거 + 의결일자 정리
            df_new = clean_columns(df_new)
            df_existing = clean_columns(df_existing)

            # 신규 내부 중복 제거
            window = Window.partitionBy("사건번호", "의결일자").orderBy("사건번호")
            df_new_deduped = df_new.withColumn("_rn", F.row_number().over(window)) \
                .filter(F.col("_rn") == 1).drop("_rn")

            # 기존 deduped에 없는 것만 추출 (left_anti join)
            df_result = df_new_deduped.join(
                df_existing.select("사건번호", "의결일자"),
                on=["사건번호", "의결일자"],
                how="left_anti"
            )

            deduped_count = df_result.count()
            internal_dup = new_count - df_new_deduped.count()
            external_dup = df_new_deduped.count() - deduped_count
            print(f"  신규 내부 중복: {internal_dup}건 제거")
            print(f"  기존과 중복: {external_dup}건 제거")
            print(f"  신규 유니크: {deduped_count}건")

            if deduped_count == 0:
                print("\n신규 유니크 데이터 없음. 종료.")
                return

            # /deduped/batch_날짜/ 에 신규분만 저장 (기존 데이터는 안 건드림)
            today = datetime.now().strftime("%Y%m%d")
            output_path = f"hdfs:///deduped/batch_{today}"
            df_result.write.mode("overwrite").json(output_path)
            print(f"\n[4/4] 저장 완료! {deduped_count}건 → /deduped/batch_{today}/")

    finally:
        spark.stop()
        print(f"\n중복 제거 종료: {datetime.now()}")


if __name__ == "__main__":
    main()