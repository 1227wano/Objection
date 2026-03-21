"""
정제 파이프라인 래퍼
사용법: python3 /app/refine/refine.py

최적화: /cleaned/_index.txt에 처리 완료된 키(사건번호|의결일자)를 인덱스로 관리.
매번 /cleaned/ 전체 JSONL을 읽지 않고 인덱스 파일만 읽어서 빠르게 필터링.

흐름:
1. /cleaned/_index.txt 에서 처리 완료 키 로드
2. /deduped/ 에서 데이터 로드
3. 인덱스에 없는 미처리 건만 필터링
4. 파이프라인 실행
5. 결과를 /cleaned/ 에 업로드
6. 인덱스 파일 갱신
"""

import sys
import os
import json
from datetime import datetime

sys.path.insert(0, "/app")
from common.hdfs_utils import (
    hdfs_get, hdfs_put, hdfs_mkdir, hdfs_ls,
    hdfs_cat, hdfs_exists, generate_filename
)
from refine.pipeline import run_pipeline

INDEX_PATH = "/cleaned/_index.txt"


def make_key(record: dict) -> str:
    """dedup과 동일한 키 생성: 사건번호|의결일자"""
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


def load_deduped_records() -> list[dict]:
    """/deduped/ 에서 전체 데이터 로드"""
    all_records = []

    if not hdfs_exists("/deduped"):
        return all_records

    files = hdfs_ls("/deduped")
    for f in files:
        if not f.endswith(".jsonl"):
            continue
        print(f"  deduped 로드: {f}")
        content = hdfs_cat(f)
        if not content:
            continue
        for line in content.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                all_records.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    return all_records


def main():
    print("=" * 60)
    print(f"정제 파이프라인 시작: {datetime.now()}")
    print("=" * 60)

    hdfs_mkdir("/cleaned")

    # 1. 처리 완료 인덱스 로드
    print("\n[1/6] 처리 완료 인덱스 로드 중...")
    processed_keys = load_processed_index()
    print(f"  이미 처리됨: {len(processed_keys)}건")

    # 2. deduped 데이터 로드
    print("\n[2/6] deduped 데이터 로드 중...")
    all_records = load_deduped_records()
    print(f"  전체 deduped: {len(all_records)}건")

    # 3. 미처리 건만 필터링
    print("\n[3/6] 미처리 건 필터링 중...")
    unprocessed = []
    for r in all_records:
        key = make_key(r)
        if key not in processed_keys:
            unprocessed.append(r)

    print(f"  미처리 건: {len(unprocessed)}건")

    if not unprocessed:
        print("\n처리할 신규 데이터 없음. 종료.")
        return

    # 4. 미처리 건을 로컬에 저장 후 파이프라인 실행
    print("\n[4/6] 전처리 파이프라인 실행 중...")
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

    # 5. 결과를 HDFS /cleaned/ 에 업로드
    print("\n[5/6] HDFS /cleaned/ 에 업로드 중...")

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

    # 6. 인덱스 갱신 (처리한 건의 키 추가)
    print("\n[6/6] 인덱스 갱신 중...")
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