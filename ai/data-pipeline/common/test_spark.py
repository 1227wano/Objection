"""
Spark + YARN 연결 테스트
사용법: python3 /app/common/test_spark.py

DataFrame API만 사용 (nodemanager에 Python 불필요).
DataFrame API는 JVM에서 직접 처리되므로 nodemanager에서 분산 처리됨.
"""

from pyspark.sql import SparkSession
import sys


def main():
    print("=" * 50)
    print("Spark + YARN 연결 테스트")
    print("=" * 50)

    # 1. SparkSession 생성
    print("\n[1/3] SparkSession 생성 중...")
    try:
        spark = SparkSession.builder \
            .appName("SparkConnectionTest") \
            .master("yarn") \
            .config("spark.submit.deployMode", "client") \
            .getOrCreate()
        spark.sparkContext.setLogLevel("ERROR")
        print(f"  Spark version: {spark.version} ✅")
    except Exception as e:
        print(f"  SparkSession 생성 실패: {e} ❌")
        sys.exit(1)

    # 2. HDFS 읽기 테스트
    print("\n[2/3] HDFS 읽기 테스트...")
    try:
        df = spark.read.json("hdfs:///raw/precedents/*.jsonl")
        count = df.count()
        print(f"  /raw/precedents/ 읽기 성공: {count}건 ✅")
        print(f"  컬럼: {df.columns}")
    except Exception as e:
        print(f"  HDFS 읽기 실패: {e} ❌")

    # 3. YARN DataFrame 분산 처리 테스트
    print("\n[3/3] YARN DataFrame 분산 처리 테스트...")
    try:
        df_test = spark.range(100).repartition(2)
        result = df_test.groupBy().sum("id").collect()[0][0]
        if result == 4950:
            print(f"  분산 합계: {result} (정답: 4950) ✅")
        else:
            print(f"  결과 불일치: {result} ❌")
    except Exception as e:
        print(f"  YARN 테스트 실패: {e} ❌")

    spark.stop()
    print("\n" + "=" * 50)
    print("테스트 완료!")
    print("=" * 50)


if __name__ == "__main__":
    main()