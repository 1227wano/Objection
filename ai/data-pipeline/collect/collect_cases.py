"""
국가법령정보센터 행정심판재결례 수집 크롤러 (API 방식)
사용법: python3 /app/collect/collect_cases.py

- 목록 API로 키워드별 본문검색 → 상세 API로 본문 수집 → JSONL → HDFS 적재
"""

import sys
import os
import json
import time
import re
from datetime import datetime

import requests

sys.path.insert(0, "/app")
from common.hdfs_utils import hdfs_put, hdfs_mkdir, generate_filename

# ── 설정 ──────────────────────────────────────────────
LAW_API_OC = "a102"
LAW_API_BASE = "http://www.law.go.kr/DRF"

# 수집 키워드 (필요 시 추가/수정)
KEYWORDS = [
    "식품접객업", "음식점", "주점", "제과점영업",
    "식당", "호프", "치킨집"
]

# 수집 설정
DISPLAY = 30
MAX_PAGE = 1
REQUEST_DELAY = 1.0


def format_date(raw: str) -> str:
    """API 날짜 형식 변환: '20170731' → '2017.07.31.'"""
    if not raw:
        return ""
    raw = raw.strip().replace(".", "").replace("-", "").replace(" ", "")
    if len(raw) == 8 and raw.isdigit():
        return f"{raw[:4]}.{raw[4:6]}.{raw[6:8]}."
    return raw


def fetch_list(keyword: str, page: int = 1) -> list[dict]:
    """목록 API 호출 → 기본 정보 + 상세링크 리스트 반환"""
    url = (
        f"{LAW_API_BASE}/lawSearch.do?"
        f"OC={LAW_API_OC}&target=decc&type=JSON"
        f"&query={keyword}&display={DISPLAY}&page={page}"
        f"&search=2&sort=ddes"
    )

    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"  [ERROR] 목록 조회 실패 ({keyword}, p{page}): {e}")
        return []

    # 응답 구조: {"Decc": {"decc": [...]}}
    decc_obj = data.get("Decc", data.get("decc", {}))
    if isinstance(decc_obj, dict):
        items = decc_obj.get("decc", [])
    elif isinstance(decc_obj, list):
        items = decc_obj
    else:
        items = []

    return items if isinstance(items, list) else []


def fetch_detail(detail_link: str) -> dict:
    """상세 API 호출 → 주문/청구취지/재결요지/이유 등 반환"""
    if not detail_link:
        return {}

    # 상대 경로인 경우 절대 경로로 변환
    if detail_link.startswith("/"):
        detail_link = f"http://www.law.go.kr{detail_link}"

    url = detail_link
    if "type=" not in url:
        url += "&type=JSON"
    else:
        url = re.sub(r"type=\w+", "type=JSON", url)

    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"    [ERROR] 상세 조회 실패: {e}")
        return {}

    detail = data.get("PrecService", data.get("precService", {}))
    if not detail:
        for key in data:
            if isinstance(data[key], dict):
                detail = data[key]
                break

    return detail


def collect_keyword(keyword: str) -> list[dict]:
    """키워드 하나에 대해 수집 수행"""
    results = []

    for page in range(1, MAX_PAGE + 1):
        print(f"  목록 조회: keyword={keyword}, page={page}")
        items = fetch_list(keyword, page)

        if not items:
            print(f"    결과 없음")
            break

        print(f"    {len(items)}건 발견")

        for i, item in enumerate(items):
            detail_link = item.get("행정심판례상세링크", "")

            time.sleep(REQUEST_DELAY)
            detail = fetch_detail(detail_link)

            record = {
                "사건번호": detail.get("사건번호", item.get("사건번호", "")).strip().replace(" ", ""),
                "사건명": detail.get("사건명", item.get("사건명", "")),
                "재결청": detail.get("재결청", item.get("재결청", "")),
                "처분청": detail.get("처분청", item.get("처분청", "")),
                "의결일자": format_date(
                    detail.get("의결일자", item.get("의결일자", ""))
                ),
                "처분일자": format_date(
                    detail.get("처분일자", item.get("처분일자", ""))
                ),
                "주문": detail.get("주문", ""),
                "청구취지": detail.get("청구취지", ""),
                "재결요지": detail.get("재결요지", ""),
                "이유": detail.get("이유", ""),
                "수집키워드": keyword,
            }

            results.append(record)
            print(f"    [{i+1}/{len(items)}] {record['사건번호']} 수집 완료")

    return results


def save_to_jsonl(records: list[dict], jsonl_path: str) -> int:
    """수집 결과를 JSONL로 저장"""
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return len(records)


def main():
    print("=" * 60)
    print(f"행정심판재결례 크롤러 시작: {datetime.now()}")
    print(f"키워드: {KEYWORDS}")
    print(f"설정: display={DISPLAY}, max_page={MAX_PAGE}, search=본문, sort=최신순")
    print("=" * 60)

    hdfs_mkdir("/raw/new")

    all_records = []
    for keyword in KEYWORDS:
        print(f"\n[{keyword}] 수집 시작...")
        records = collect_keyword(keyword)
        all_records.extend(records)
        print(f"[{keyword}] {len(records)}건 수집 완료")

    if not all_records:
        print("\n수집된 데이터 없음. 종료.")
        return

    # 중복 제거 (사건번호 기준)
    seen = set()
    unique_records = []
    for r in all_records:
        key = r["사건번호"]
        if key and key not in seen:
            seen.add(key)
            unique_records.append(r)

    print(f"\n전체 {len(all_records)}건 중 중복 제거 후 {len(unique_records)}건")

    # JSONL 저장
    jsonl_filename = generate_filename("new")
    jsonl_path = f"/tmp/{jsonl_filename}"
    count = save_to_jsonl(unique_records, jsonl_path)
    print(f"JSONL 저장: {jsonl_path} ({count}건)")

    # HDFS 적재
    hdfs_mkdir("/raw/new")
    hdfs_path = f"/raw/new/{jsonl_filename}"

    print(f"HDFS 적재: {hdfs_path}")
    success = hdfs_put(jsonl_path, hdfs_path)

    if success:
        print(f"\n완료! {count}건 → {hdfs_path}")
    else:
        print("\n[ERROR] HDFS 적재 실패")
        sys.exit(1)

    os.remove(jsonl_path)
    print(f"\n크롤러 종료: {datetime.now()}")


if __name__ == "__main__":
    main()