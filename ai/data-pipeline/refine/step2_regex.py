"""
Step 2: Regex 법안 참조 추출
LLM 교체 후 텍스트에서 법안 참조를 정규표현식으로 추출.
"""

import re


KNOWN_MULTI_WORD_LAWS: set[str] = {
    "청소년 보호법", "청소년보호법",
    "청소년 보호법 시행령", "청소년보호법 시행령",
    "청소년 보호법 시행규칙", "청소년보호법 시행규칙",
    "먹는물 관리법", "먹는물관리법",
    "먹는물 수질기준 및 검사 등에 관한 규칙",
    "가축전염병 예방법", "가축전염병예방법",
    "부동산 실권리자명의 등기에 관한 법률",
    "산업집적활성화 및 공장설립에 관한 법률",
    "산업집적활성화 및 공장설립에 관한 법률 시행령",
    "게임산업진흥에 관한 법률",
    "노인장기요양보험법",
}


def _parse_article_detail(article_str: str) -> dict:
    result = {"조": "", "항": None, "호": None}
    m = re.match(r'(제\d+조(?:의\d+)?)', article_str)
    if m:
        result["조"] = m.group(1)
    m_hang = re.search(r'제(\d+)항', article_str)
    if m_hang:
        result["항"] = int(m_hang.group(1))
    m_ho = re.search(r'제(\d+)호', article_str)
    if m_ho:
        result["호"] = int(m_ho.group(1))
    return result


def _detect_sub_law_suffix(text: str, article_start: int) -> str | None:
    pre_text = text[max(0, article_start - 20):article_start]
    m = re.search(r'(시행령|시행규칙)\s*$', pre_text)
    return m.group(1) if m else None


def _find_nearest_law_name(text: str, pos: int) -> str | None:
    before_text = text[:pos]
    explicit_pattern = r'[「]([\w\s]+?(?:법률?(?:\s*시행(?:령|규칙))?|규칙|령))[」]|(?<![「])([\w]+법률?(?:\s*시행(?:령|규칙))?)(?![」\w])'
    indirect_pattern = r'(같은\s*법|동법)'

    all_matches = []
    for m in re.finditer(explicit_pattern, before_text):
        name = m.group(1) or m.group(2)
        if not name:
            continue
        name = name.strip()
        if re.match(r'^(같은\s*법|동법)', name):
            continue
        if m.group(2):
            match_start = m.start(2)
            pre_text_slice = before_text[:match_start].rstrip()
            if pre_text_slice and re.search(r'[가-힣]$', pre_text_slice):
                words_before = pre_text_slice.split()
                for k in range(1, min(4, len(words_before) + 1)):
                    candidate = " ".join(words_before[-k:]) + " " + name
                    candidate_normalized = candidate.replace(" ", "")
                    known_normalized = {k.replace(" ", ""): k for k in KNOWN_MULTI_WORD_LAWS}
                    if candidate_normalized in known_normalized:
                        name = known_normalized[candidate_normalized]
                    candidate_joined = candidate_normalized.replace(" ", "")
                    if candidate_joined in KNOWN_MULTI_WORD_LAWS:
                        name = candidate_joined
                        break
        all_matches.append({"pos": m.start(), "type": "explicit", "name": name})

    for m in re.finditer(indirect_pattern, before_text):
        all_matches.append({"pos": m.start(), "type": "indirect"})

    if not all_matches:
        return None

    all_matches.sort(key=lambda x: x["pos"], reverse=True)
    for match in all_matches:
        if match["type"] == "explicit":
            return match["name"]
    return None


def extract_law_references(text: str) -> list[dict]:
    """LLM 교체 후 정리된 텍스트에서 법안 참조를 추출한다."""
    ARTICLE_PART = r'(제\d+조(?:의\d+)?(?:\s*제\d+항)?(?:\s*제\d+호)?(?:\s*제\d+목)?)'
    pattern_explicit  = r'(?:[「]([\w\s]+?(?:법률?(?:\s*시행(?:령|규칙))?|규칙|령))[」]|([\w]+법률?(?:\s*시행(?:령|규칙))?))\s*' + ARTICLE_PART
    pattern_same      = r'(?:같은\s*법|동법)[」]?\s*' + ARTICLE_PART
    pattern_same_sub  = r'(?:같은\s*법|동법)\s*(시행령|시행규칙)\s*' + ARTICLE_PART
    pattern_sub_standalone = r'(?<![가-힣])(시행령|시행규칙)\s*' + ARTICLE_PART
    pattern_listed    = r'(?:[,ㆍ·]\s*|및\s+)' + ARTICLE_PART
    pattern_standalone = ARTICLE_PART

    references = []
    seen_spans = set()

    # 1단계: 명시적 법명
    for match in re.finditer(pattern_explicit, text):
        law_name = (match.group(1) or match.group(2) or "").strip()
        article = match.group(3)
        span = match.span()
        if span in seen_spans or not law_name:
            continue
        if re.match(r'^(동법|같은\s*법)', law_name):
            continue
        seen_spans.add(span)
        detail = _parse_article_detail(article)
        references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    # 2단계: 같은 법 시행령/규칙
    for match in re.finditer(pattern_same_sub, text):
        sub_type = match.group(1)
        article = match.group(2)
        span = match.span()
        if span in seen_spans:
            continue
        base_law = _find_nearest_law_name(text, match.start())
        if base_law:
            law_name = f"{base_law} {sub_type}" if sub_type not in base_law else base_law
            seen_spans.add(span)
            detail = _parse_article_detail(article)
            references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    # 2.5단계: standalone 시행령/규칙
    for match in re.finditer(pattern_sub_standalone, text):
        sub_type = match.group(1)
        article = match.group(2)
        span = match.span()
        overlap = any(not (match.end() <= s[0] or match.start() >= s[1]) for s in seen_spans)
        if overlap:
            continue
        base_law = _find_nearest_law_name(text, match.start())
        if base_law:
            law_name = f"{base_law} {sub_type}" if sub_type not in base_law else base_law
            seen_spans.add(span)
            detail = _parse_article_detail(article)
            references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    # 3단계: 같은 법/동법
    for match in re.finditer(pattern_same, text):
        article = match.group(1)
        span = match.span()
        if span in seen_spans:
            continue
        law_name = _find_nearest_law_name(text, match.start())
        if law_name:
            seen_spans.add(span)
            detail = _parse_article_detail(article)
            references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    # 4단계: 나열형 조항
    for match in re.finditer(pattern_listed, text):
        article = match.group(1)
        article_start, article_end = match.start(1), match.end(1)
        span = (article_start, article_end)
        if span in seen_spans:
            continue
        overlap = any(not (article_end <= s[0] or article_start >= s[1]) for s in seen_spans)
        if overlap:
            continue
        law_name = _find_nearest_law_name(text, match.start())
        if law_name:
            sub_suffix = _detect_sub_law_suffix(text, article_start)
            if sub_suffix and sub_suffix not in law_name:
                law_name = f"{law_name} {sub_suffix}"
            seen_spans.add(span)
            detail = _parse_article_detail(article)
            references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    # 5단계: fallback 단독 조항
    for match in re.finditer(pattern_standalone, text):
        article = match.group(1)
        article_start, article_end = match.start(1), match.end(1)
        span = (article_start, article_end)
        overlap = any(not (article_end <= s[0] or article_start >= s[1]) for s in seen_spans)
        if overlap:
            continue
        law_name = _find_nearest_law_name(text, match.start())
        if law_name:
            sub_suffix = _detect_sub_law_suffix(text, article_start)
            if sub_suffix and sub_suffix not in law_name:
                law_name = f"{law_name} {sub_suffix}"
            seen_spans.add(span)
            detail = _parse_article_detail(article)
            references.append({"법명": law_name, "조항": article, **detail, "원문_위치": span})

    references.sort(key=lambda r: r["원문_위치"][0])
    return references