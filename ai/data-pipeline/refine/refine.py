"""
정제 파이프라인 래퍼 (Spark 로드 + Python 처리)
사용법: python3 /app/refine/refine.py

효율적 방식: /deduped/ 전체가 아닌 최근 배치만 읽기.
- 첫 실행 (인덱스 없음): /deduped/init/ 읽기
- 이후 실행: 가장 최근 batch_날짜/ 폴더만 읽기

흐름:
1. /cleaned/_index.txt 에서 처리 완료 키 로드
2. Spark로 최근 배치만 읽기
3. 인덱스에 없는 미처리 건만 필터링
4. Python 파이프라인 실행 (LLM/API 호출)
5. 결과를 /cleaned/ 에 업로드
6. 인덱스 파일 갱신
"""

import sys
import os
import json
from datetime import datetime

sys.path.insert(0, "/app")
from common.hdfs_utils import (
    hdfs_put, hdfs_mkdir, hdfs_ls,
    hdfs_cat, hdfs_exists, generate_filename
)
from refine.pipeline import run_pipeline

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

INDEX_PATH = "/cleaned/_index.txt"


def get_spark():
    """YARN 연결된 SparkSession 생성"""
    return SparkSession.builder \
        .appName("RefinePipeline") \
        .master("yarn") \
        .config("spark.submit.deployMode", "client") \
        .getOrCreate()


def make_key(record: dict) -> str:
    """중복 판별 키 생성: 사건번호 + 의결일자"""
    case_no = record.get("사건번호", "").strip()
    date = record.get("의결일자", "").strip().rstrip(".")
    return f"{case_no}|{date}"


def load_processed_index() -> set:
    """인덱스 파일에서 처리 완료 키 로드"""
    if not hdfs_exists(INDEX_PATH):
        print("  인덱스 파일 없음 → 빈 set")
        return set()

    content = hdfs_cat(INDEX_PATH)
    if not content:
        return set()

    keys = set()
    for line in content.strip().split("\n"):
        line = line.strip()
        if line:
            keys.add(line)

    return keys


def save_processed_index(existing_keys: set, new_keys: set):
    """인덱스 파일에 새로 처리된 키 추가"""
    all_keys = existing_keys | new_keys
    local_path = "/tmp/_index.txt"

    with open(local_path, "w", encoding="utf-8") as f:
        for key in sorted(all_keys):
            f.write(key + "\n")

    hdfs_put(local_path, INDEX_PATH, overwrite=True)
    os.remove(local_path)
    print(f"  인덱스 갱신: {len(existing_keys)}개 → {len(all_keys)}개 (+{len(new_keys)})")


def find_target_folder() -> str | None:
    """
    읽을 deduped 폴더 결정:
    - 인덱스 없음 (첫 실행) → /deduped/init/
    - 인덱스 있음 (이후) → 가장 최근 batch_날짜/ 폴더
    """
    if not hdfs_exists("/deduped"):
        return None

    folders = hdfs_ls("/deduped")
    if not folders:
        return None

    # init/ 폴더 존재 확인
    init_folder = None
    batch_folders = []

    for f in folders:
        name = f.split("/")[-1]
        if name == "init":
            init_folder = f
        elif name.startswith("batch_"):
            batch_folders.append(f)

    # 인덱스가 없으면 첫 실행 → init/
    if not hdfs_exists(INDEX_PATH):
        return init_folder

    # batch 폴더가 있으면 최근 것 선택
    if batch_folders:
        batch_folders.sort()
        return batch_folders[-1]

    # batch 없으면 init (아직 한 번도 크롤링 안 한 경우)
    return init_folder


def main():
    print("=" * 60)
    print(f"정제 파이프라인 시작 (Spark 로드, 최근 배치): {datetime.now()}")
    print("=" * 60)

    hdfs_mkdir("/cleaned")

    # 1. 처리 완료 인덱스 로드
    print("\n[1/6] 처리 완료 인덱스 로드 중...")
    processed_keys = load_processed_index()
    is_first_run = len(processed_keys) == 0
    print(f"  이미 처리됨: {len(processed_keys)}건")
    print(f"  {'→ 첫 실행: init/ 읽기' if is_first_run else '→ 이후 실행: 최근 batch만 읽기'}")

    # 2. 읽을 폴더 결정
    print("\n[2/6] 대상 폴더 결정 중...")
    target_folder = find_target_folder()

    if not target_folder:
        print("  /deduped/ 에 데이터 없음. 종료.")
        return

    print(f"  대상: {target_folder}")

    # 3. Spark로 해당 폴더만 읽기
    print("\n[3/6] Spark로 데이터 로드 중...")
    spark = get_spark()
    spark.sparkContext.setLogLevel("WARN")
    print(f"  Spark version: {spark.version}")

    try:
        df = spark.read.json(f"hdfs://{target_folder}/")
        total = df.count()
        print(f"  로드 완료: {total}건")

        if total == 0:
            print("  데이터 없음. 종료.")
            return

        # 사건번호 공백 제거 + 의결일자 정리
        df = df \
            .withColumn("사건번호", F.regexp_replace(F.trim(F.col("사건번호")), r"\s+", "")) \
            .withColumn("의결일자", F.trim(F.regexp_replace("의결일자", r"\.$", "")))

        # Python 리스트로 변환
        all_records = [row.asDict() for row in df.collect()]
        print(f"  Python 리스트 변환 완료: {len(all_records)}건")

    finally:
        spark.stop()
        print("  Spark 세션 종료")

    # 4. 미처리 건만 필터링
    print("\n[4/6] 미처리 건 필터링 중...")
    unprocessed = []
    for r in all_records:
        key = make_key(r)
        if key not in processed_keys:
            unprocessed.append(r)

    print(f"  미처리 건: {len(unprocessed)}건")

    if not unprocessed:
        print("\n처리할 신규 데이터 없음. 종료.")
        return

    # 5. 파이프라인 실행
    print("\n[5/6] 전처리 파이프라인 실행 중...")
    local_input = "/tmp/refine_input.jsonl"
    local_output = "/tmp/refine_result.jsonl"
    local_low_conf = "/tmp/refine_low_confidence.jsonl"

    with open(local_input, "w", encoding="utf-8") as f:
        for r in unprocessed:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    result_count, low_conf_count = run_pipeline(
        input_path=local_input,
        output_path=local_output,
        low_conf_path=local_low_conf
    )

    print(f"  정상 처리: {result_count}건")
    print(f"  low confidence: {low_conf_count}건")

    # 6. 결과 업로드 + 인덱스 갱신
    print("\n[6/6] HDFS /cleaned/ 에 업로드 + 인덱스 갱신 중...")

    if result_count > 0:
        filename = generate_filename("cleaned")
        hdfs_path = f"/cleaned/{filename}"
        success = hdfs_put(local_output, hdfs_path)
        if success:
            print(f"  정상 결과: {result_count}건 → {hdfs_path}")

    if low_conf_count > 0:
        low_filename = generate_filename("cleaned_low_conf")
        low_hdfs_path = f"/cleaned/{low_filename}"
        success = hdfs_put(local_low_conf, low_hdfs_path)
        if success:
            print(f"  low confidence: {low_conf_count}건 → {low_hdfs_path}")

    # 인덱스 갱신
    new_keys = set()
    for r in unprocessed:
        new_keys.add(make_key(r))
    save_processed_index(processed_keys, new_keys)

    # 임시 파일 정리
    for f in [local_input, local_output, local_low_conf]:
        if os.path.exists(f):
            os.remove(f)

    print(f"\n정제 파이프라인 종료: {datetime.now()}")


if __name__ == "__main__":
    main()