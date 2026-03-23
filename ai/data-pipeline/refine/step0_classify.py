"""
Step 0: 처분유형 분류
해당 없는 사건은 skip 처리.
"""


VALID_DISPOSITION_TYPES = {
    "영업정지":     ["영업정지"],
    "영업허가취소": ["영업허가취소", "허가취소", "영업허가 취소"],
    "과징금":       ["과징금"],
    "영업폐쇄명령": ["영업폐쇄명령", "영업폐쇄", "폐쇄명령"],
}


def classify_disposition(case: dict) -> str | None:
    search_texts = [
        case.get("주문", ""),
        case.get("사건명", ""),
        case.get("청구취지", ""),
    ]
    combined = " ".join(search_texts)
    for dtype, keywords in VALID_DISPOSITION_TYPES.items():
        if any(kw in combined for kw in keywords):
            return dtype
    return None