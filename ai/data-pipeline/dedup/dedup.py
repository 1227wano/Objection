"""
중복 제거 스크립트
사용법: python3 /app/dedup/dedup.py

흐름:
- 첫 실행 (/deduped/ 비어있음): /raw/precedents/ + /raw/new/ 전부 로드 → 중복 제거 → /deduped/ 저장
- 이후 실행 (/deduped/ 데이터 있음): /raw/new/만 로드 → 기존 /deduped/와 비교 → 신규분만 추가
"""

import sys
import os
import json
import subprocess
from datetime import datetime

sys.path.insert(0, "/app")
from common.hdfs_utils import (
    hdfs_put, hdfs_mkdir, hdfs_ls, hdfs_cat,
    hdfs_exists, generate_filename
)


def make_key(record: dict) -> str:
    """중복 판별 키 생성: 사건번호 + 의결일자"""
    case_no = record.get("사건번호", "").strip()
    date = record.get("의결일자", "").strip().rstrip(".")
    return f"{case_no}|{date}"


def load_jsonl_from_hdfs(hdfs_path: str) -> list[dict]:
    """HDFS의 JSONL 파일 내용을 읽어서 리스트로 반환"""
    content = hdfs_cat(hdfs_path)
    if not content:
        return []

    records = []
    for line in content.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return records


def load_existing_keys() -> set:
    """기존 /deduped/ 의 모든 파일에서 키 목록 추출"""
    keys = set()

    if not hdfs_exists("/deduped"):
        return keys

    files = hdfs_ls("/deduped")
    for f in files:
        if not f.endswith(".jsonl"):
            continue
        print(f"  기존 파일 로드: {f}")
        records = load_jsonl_from_hdfs(f)
        for r in records:
            keys.add(make_key(r))

    return keys


def load_new_data() -> list[dict]:
    """/raw/new/ 데이터 로드"""
    all_records = []

    if not hdfs_exists("/raw/new"):
        return all_records

    files = hdfs_ls("/raw/new")
    for f in files:
        if not f.endswith(".jsonl"):
            continue
        print(f"  신규 파일 로드: {f}")
        records = load_jsonl_from_hdfs(f)
        all_records.extend(records)

    return all_records


def load_precedents_data() -> list[dict]:
    """/raw/precedents/ 과거 데이터 로드"""
    all_records = []

    if not hdfs_exists("/raw/precedents"):
        return all_records

    files = hdfs_ls("/raw/precedents")
    for f in files:
        if not f.endswith(".jsonl"):
            continue
        print(f"  과거 파일 로드: {f}")
        records = load_jsonl_from_hdfs(f)
        all_records.extend(records)

    return all_records


def main():
    print("=" * 60)
    print(f"중복 제거 시작: {datetime.now()}")
    print("=" * 60)

    hdfs_mkdir("/deduped")

    # 1. 기존 deduped 키 로드
    print("\n[1/4] 기존 deduped 키 로드 중...")
    existing_keys = load_existing_keys()
    is_first_run = len(existing_keys) == 0
    print(f"  기존 키: {len(existing_keys)}개")

    if is_first_run:
        print("  → 첫 실행: 과거 + 신규 전부 로드")
    else:
        print("  → 이후 실행: 신규(/raw/new/)만 로드")

    # 2. 데이터 로드
    print("\n[2/4] 원본 데이터 로드 중...")
    new_records = load_new_data()
    print(f"  신규(new): {len(new_records)}건")

    if is_first_run:
        precedents_records = load_precedents_data()
        print(f"  과거(precedents): {len(precedents_records)}건")
        all_raw = precedents_records + new_records
    else:
        all_raw = new_records

    print(f"  로드 대상 합계: {len(all_raw)}건")

    if not all_raw:
        print("\n원본 데이터 없음. 종료.")
        return

    # 3. 중복 제거
    print("\n[3/4] 중복 제거 중...")
    seen = set()
    unique_records = []
    dup_with_existing = 0
    dup_in_raw = 0

    for r in all_raw:
        key = make_key(r)

        # 기존 deduped에 이미 있으면 스킵
        if key in existing_keys:
            dup_with_existing += 1
            continue

        # 현재 처리 중인 데이터 내 중복 스킵
        if key in seen:
            dup_in_raw += 1
            continue

        seen.add(key)
        unique_records.append(r)

    print(f"  기존 deduped와 중복: {dup_with_existing}건 제거")
    print(f"  데이터 내 자체 중복: {dup_in_raw}건 제거")
    print(f"  신규 유니크: {len(unique_records)}건")

    if not unique_records:
        print("\n신규 유니크 데이터 없음. 종료.")
        return

    # 4. /deduped/ 에 저장
    print("\n[4/4] HDFS /deduped/ 에 저장 중...")
    filename = generate_filename("deduped")
    local_path = f"/tmp/{filename}"

    with open(local_path, "w", encoding="utf-8") as f:
        for r in unique_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    hdfs_path = f"/deduped/{filename}"
    success = hdfs_put(local_path, hdfs_path)

    if success:
        print(f"\n완료! {len(unique_records)}건 → {hdfs_path}")
    else:
        print("\n[ERROR] HDFS 적재 실패")
        sys.exit(1)

    os.remove(local_path)
    print(f"\n중복 제거 종료: {datetime.now()}")


if __name__ == "__main__":
    main()