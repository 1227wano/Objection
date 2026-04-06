"""
Step 3: 법제처 API 조회 + 조문 치환
법안 참조에 대해 법제처 API로 실제 조문 내용을 가져와 원문에 삽입.
"""

import re
import xml.etree.ElementTree as ET
from urllib.parse import quote

import requests

# ── API 설정 ──────────────────────────────────────────────────
LAW_API_OC = "a102"
LAW_API_BASE = "http://www.law.go.kr/DRF"


KNOWN_LAW_IDS: dict[str, str] = {
    "행정심판법": "001363", "행정심판법 시행령": "005621", "행정심판법 시행규칙": "008712",
    "행정기본법": "014041", "행정기본법 시행령": "014156",
    "행정절차법": "001362", "행정절차법 시행령": "005625", "행정절차법 시행규칙": "008720",
    "식품위생법": "001805", "식품위생법 시행령": "004097", "식품위생법 시행규칙": "007634",
    "청소년보호법": "000815", "청소년 보호법": "000815", "청소년보호법 시행령": "005209",
    "부동산실명법": "001178", "부동산 실권리자명의 등기에 관한 법률": "001178",
    "수도법": "001818", "수도법 시행령": "004004",
    "먹는물관리법": "000165", "먹는물 수질기준 및 검사 등에 관한 규칙": "007134",
    "폐기물관리법": "010722", "폐기물관리법 시행령": "010887", "폐기물관리법 시행규칙": "010891",
    "가축전염병예방법": "001504", "가축전염병 예방법": "001504",
    "전자정부법": "009199", "부가가치세법": "001571",
    "산업집적활성화 및 공장설립에 관한 법률": "001463",
    "산업집적활성화 및 공장설립에 관한 법률 시행령": "002351",
    "풍속영업의 규제에 관한 법률": "000964",
}

LAW_NAME_ALIASES: dict[str, str] = {
    "부동산실명법": "부동산 실권리자명의 등기에 관한 법률",
    "풍속영업규제법": "풍속영업의 규제에 관한 법률"
}

_law_id_cache: dict[str, str | None] = {}
_law_text_cache: dict[str, str] = {}


def _normalize_law_name(law_name: str) -> str:
    law_name = re.sub(r'(법)(시행(?:령|규칙))', r'\1 \2', law_name)
    law_name = re.sub(r'\s+', ' ', law_name).strip()
    return LAW_NAME_ALIASES.get(law_name, law_name)


def _parse_article_to_jo(article: str) -> str:
    m = re.match(r'제(\d+)조(?:의(\d+))?', article)
    if not m:
        return "000000"
    jo_num = int(m.group(1))
    sub_num = int(m.group(2)) if m.group(2) else 0
    return f"{jo_num:04d}{sub_num:02d}"


def _search_law_id(law_name: str) -> str | None:
    law_name = _normalize_law_name(law_name)
    if law_name in _law_id_cache:
        return _law_id_cache[law_name]
    if law_name in KNOWN_LAW_IDS:
        _law_id_cache[law_name] = KNOWN_LAW_IDS[law_name]
        return KNOWN_LAW_IDS[law_name]
    url = f"{LAW_API_BASE}/lawSearch.do?OC={LAW_API_OC}&target=law&type=XML&query={quote(law_name)}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        for law_el in root.findall(".//law"):
            status_el = law_el.find("현행연혁코드")
            if status_el is not None and status_el.text and status_el.text.strip() == "현행":
                law_id_el = law_el.find("법령ID")
                if law_id_el is not None and law_id_el.text:
                    law_id = law_id_el.text.strip()
                    _law_id_cache[law_name] = law_id
                    return law_id
        law_id_el = root.find(".//법령ID")
        if law_id_el is not None and law_id_el.text:
            law_id = law_id_el.text.strip()
            _law_id_cache[law_name] = law_id
            return law_id
    except Exception as e:
        print(f"    [법령검색 실패] {law_name}: {e}")
    _law_id_cache[law_name] = None
    return None


def _get_article_history(law_id: str, jo: str) -> list[dict]:
    url = f"{LAW_API_BASE}/lawService.do?OC={LAW_API_OC}&target=lsJoHstInf&ID={law_id}&JO={jo}&type=JSON&display=100"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        raw_items = []
        if isinstance(data, dict):
            law_service = data.get("LawService", data)
            if isinstance(law_service, dict):
                raw_items = law_service.get("law", [])
            elif isinstance(law_service, list):
                raw_items = law_service
        if isinstance(raw_items, dict):
            raw_items = [raw_items]
        elif isinstance(raw_items, str):
            raw_items = []
        result = []
        for item in raw_items:
            if not isinstance(item, dict):
                continue
            jo_info = item.get("조문정보", {})
            law_info = item.get("법령정보", {})
            result.append({
                "시행일자":   law_info.get("시행일자", 0),
                "공포일자":   law_info.get("공포일자", 0),
                "변경사유":   jo_info.get("변경사유", ""),
                "조문링크":   jo_info.get("조문링크", ""),
                "조문번호":   jo_info.get("조문번호", ""),
                "조문변경일": jo_info.get("조문변경일", ""),
            })
        return result
    except Exception as e:
        print(f"    [변경이력 조회 실패] law_id={law_id}, jo={jo}: {e}")
        return []


def _parse_date_int(date_val) -> int:
    if isinstance(date_val, int):
        return date_val
    s = str(date_val).replace(".", "").replace("-", "").strip()
    try:
        return int(s)
    except ValueError:
        return 0


def _find_applicable_version(history: list[dict], base_date_int: int) -> dict | None:
    if not history:
        return None
    if base_date_int == 0:
        return sorted(history, key=lambda h: _parse_date_int(h.get("시행일자", 0)), reverse=True)[0]

    applicable_revisions = [
        h for h in history
        if h.get("변경사유") == "전부개정"
           and _parse_date_int(h.get("시행일자", 0)) <= base_date_int
    ]
    if applicable_revisions:
        latest_revision = max(applicable_revisions, key=lambda h: _parse_date_int(h.get("시행일자", 0)))
        revision_pub_date = _parse_date_int(latest_revision.get("공포일자", 0))
        if revision_pub_date > 0:
            filtered = [h for h in history if _parse_date_int(h.get("공포일자", 0)) >= revision_pub_date]
            if filtered:
                history = filtered

    candidates = [(_parse_date_int(h.get("시행일자", 0)),
                   _parse_date_int(h.get("공포일자", 0)),
                   h) for h in history
                  if _parse_date_int(h.get("시행일자", 0)) <= base_date_int]
    if candidates:
        return sorted(candidates, key=lambda x: (x[0], x[1]), reverse=True)[0][2]
    return sorted(history, key=lambda h: _parse_date_int(h.get("시행일자", 0)))[0]


def _fetch_article_content(article_link: str, hang: int = None, ho: int = None) -> str:
    url = article_link.replace("OC=test", f"OC={LAW_API_OC}").replace("type=HTML", "type=XML")
    if url.startswith("/"):
        url = f"http://www.law.go.kr{url}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        title_el = root.find(".//조문내용")
        title = title_el.text.strip() if title_el is not None and title_el.text else ""

        if hang is not None:
            circled = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
            for hang_el in root.findall(".//항"):
                hang_num_el = hang_el.find("항번호")
                if hang_num_el is not None and hang_num_el.text:
                    num_text = hang_num_el.text.strip()
                    num = circled.index(num_text) + 1 if num_text in circled else int(re.search(r'\d+', num_text).group() if re.search(r'\d+', num_text) else 0)
                    if num == hang:
                        hang_content_el = hang_el.find("항내용")
                        if hang_content_el is not None and hang_content_el.text:
                            result = hang_content_el.text.strip()
                            if ho is not None:
                                for ho_el in hang_el.findall("호"):
                                    ho_num_el = ho_el.find("호번호")
                                    if ho_num_el is not None and ho_num_el.text:
                                        ho_num_text = ho_num_el.text.strip().rstrip(".")
                                        try:
                                            ho_num = int(ho_num_text)
                                        except ValueError:
                                            continue
                                        if ho_num == ho:
                                            ho_content_el = ho_el.find("호내용")
                                            if ho_content_el is not None and ho_content_el.text:
                                                result += " " + ho_content_el.text.strip()
                                            break
                            return result
            return title if title else ""

        parts = [title] if title else []
        for hang_el in root.findall(".//항"):
            hang_content_el = hang_el.find("항내용")
            if hang_content_el is not None and hang_content_el.text:
                parts.append(hang_content_el.text.strip())
        return " ".join(parts) if parts else ""
    except Exception as e:
        print(f"    [조문내용 조회 실패] {article_link}: {e}")
        return ""


def fetch_law_text(law_name: str, ref: dict, case: dict) -> str:
    article  = ref.get("조항", "")
    jo_str   = ref.get("조", article)
    hang     = ref.get("항")
    ho       = ref.get("호")
    base_date_str = case.get("처분일자", "") or case.get("의결일자", "") or ""
    base_date_int = _parse_date_int(base_date_str)

    law_id = _search_law_id(law_name)
    if not law_id:
        return f"[{law_name} {article}: 법령 ID 조회 실패]"

    jo = _parse_article_to_jo(jo_str)
    history = _get_article_history(law_id, jo)

    if not history:
        base_law = re.sub(r'\s*시행(?:령|규칙)$', '', law_name).strip()
        if base_law != law_name:
            fallback_id = _search_law_id(base_law)
            if fallback_id:
                history = _get_article_history(fallback_id, jo)
                if history:
                    law_name = base_law
                    law_id = fallback_id

    if not history:
        return f"[{law_name} {article}: 변경이력 없음]"

    version = _find_applicable_version(history, base_date_int)
    if not version:
        return f"[{law_name} {article}: 적용 가능 버전 없음]"

    article_link = str(version.get("조문링크", ""))
    if not article_link:
        return f"[{law_name} {article}: 조문링크 없음]"

    content = _fetch_article_content(article_link, hang=hang, ho=ho)
    return content if content else f"[{law_name} {article}: 조문 내용 조회 실패]"


def get_law_text_cached(ref: dict, case: dict) -> str:
    law_name = _normalize_law_name(ref["법명"])
    article  = ref["조항"]
    base_date_str = case.get("처분일자", "") or case.get("의결일자", "") or ""
    cache_key = f"{law_name}|{article}|{base_date_str}"
    if cache_key not in _law_text_cache:
        _law_text_cache[cache_key] = fetch_law_text(law_name, ref, case)
    return _law_text_cache[cache_key]


def _format_date(date_str: str) -> str:
    if not date_str:
        return ""
    s = date_str.strip().rstrip(".").replace(".", "-")
    if re.match(r'^\d{4}-\d{2}-\d{2}$', s):
        return s
    s_digits = s.replace("-", "")
    if re.match(r'^\d{8}$', s_digits):
        return f"{s_digits[:4]}-{s_digits[4:6]}-{s_digits[6:8]}"
    return s


def substitute_law_references(case: dict) -> dict:
    """법안 참조를 실제 조문 내용으로 치환한다."""
    text = case.get("이유", "")
    references = case.get("법안_참조", [])
    sorted_refs = sorted(references, key=lambda r: r["원문_위치"][0], reverse=True)

    for ref in sorted_refs:
        law_text = get_law_text_cached(ref, case)
        start, end = ref["원문_위치"]
        original = text[start:end]
        text = text[:start] + f"{original} ({law_text})" + text[end:]

    # 패턴 1: 「법령명」법령명 → 법령명
    text = re.sub(r'[「]([\w\s]+?(?:법|령|규칙))[」]\s*([\w\s]+?(?:법|령|규칙))(?=\s|제|및|에|을|를|의|은|는)',
                  lambda m: m.group(1) if m.group(1).strip() == m.group(2).strip() else m.group(0),
                  text)
    # 패턴 2: 법령명 법령명 연속 → 법령명
    text = re.sub(r'([\w]+?(?:법|시행령|시행규칙))\s+\1', r'\1', text)
    # 패턴 3: 남은 「법령명」 → 법령명
    text = re.sub(r'[「]([\w\s]+?(?:법|령|규칙))[」]', r'\1', text)

    return {
        "사건번호":  case.get("사건번호", ""),
        "사건명":    case.get("사건명", ""),
        "재결청":    case.get("재결청", ""),
        "처분청":    case.get("처분청", ""),
        "의결일자":  _format_date(case.get("의결일자", "")),
        "처분일자":  _format_date(case.get("처분일자", "")),
        "주문":      case.get("주문", ""),
        "청구취지":  case.get("청구취지", ""),
        "재결요지":  case.get("재결요지", ""),
        "이유":      text,
        "수집키워드": case.get("수집키워드", ""),
        "판례종류":  "음식업",
    }