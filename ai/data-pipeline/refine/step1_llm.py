"""
Step 1: LLM 법령명 교체
모호한 법령 참조를 정확한 법령명으로 교체.
GMS API (SSAFY OpenAI 프록시)를 사용.
"""

import json
import requests

# ── API 설정 ──────────────────────────────────────────────────
GMS_KEY = "S14P22A102-e5582d17-de07-47a5-8b83-d3fdfacf3ca8"
GMS_BASE_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
GMS_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GMS_KEY}",
}

LLM_MODEL = "gpt-4.1-mini"


SYSTEM_PROMPT = """
당신은 한국 행정법 전문가입니다.
판례 원문 전체를 반드시 끝까지 읽고, 법령명이 바로 앞에 명시되지 않은 모든 조문 참조를 찾아 교체 목록을 반환하세요.

[처리 제외 대상]
- 「법령명」바로 뒤에 공백 없이 또는 한 칸 공백으로 이어지는 제X조,
  즉 「법령명」제X조 또는 「법령명」 제X조 형태는 이미 확정된 참조입니다.
  이 조항은 substitution 목록에 포함하지 마세요.
- 단, 「법령명」제X조, 제Y조처럼 쉼표·및 뒤에 나열된 제Y조는
  별도 법령에 속할 수 있으므로 반드시 검증 대상으로 처리하세요.

[판단 기준]
1. 아래 섹션들이 "본문"입니다. 이 섹션에서 조문이 특정 법령명과 함께 등장하면 최우선 근거로 사용하세요.
   - 1. 사건개요
   - 2. 청구인 주장
   - 3. 피청구인 주장
   - 5. 인정사실
   - 6. 판단
   예) 6.판단 섹션에 「식품위생법시행규칙」제89조 가 나오면 → 식품위생법 시행규칙 제89조 확정

2. "4. 관계법령" 섹션은 본문이 아닙니다. 본문에 근거가 없을 때만 참고하세요.

3. 단독으로 나오는 "제X조"는 반드시 본문(1~3, 5~6번 섹션) 전체를 먼저 검색해서
   해당 조문 번호가 특정 법령명과 함께 등장하는 사례를 찾으세요.
   예) 단독 제89조 처리 시 → 6.판단에서 「식품위생법시행규칙」제89조 발견
       → 관계법령에 시행령 제89조로 나와 있어도 무시하고 식품위생법 시행규칙 제89조로 확정
   본문에서 찾은 근거가 관계법령과 충돌하면 반드시 본문을 우선하세요.

[처리 대상]
- 원문 전체 섹션(관계법령 포함)에서 아래 패턴을 찾으세요.
- "법 제X조", "시행령 제X조", "시행규칙 제X조"
- "같은 법 제X조", "동법 제X조"
- "규칙 제X조", "령 제X조"
- 쉼표 뒤 단독 "제X조" (예: 「식품위생법 시행령」제53조, 제89조 → 제89조 별도 검증)
- 법령명 없이 단독으로 나오는 "제X조"

[confidence 기준]
- high:   본문에서 법령명과 함께 명시된 경우
- medium: 본문에 직접 근거는 없지만 관계법령 섹션 또는 업종·처분 유형으로 추론한 경우
- low:    원문만으로는 추론이 어려운 경우

[처리 규칙]
1. 교체 후 반드시 "법령명 제X조" 형태가 되어야 합니다.
2. 추론 불가 시 "[법령명 미상] 제X조" 로 표시하세요.
3. original 필드는 원문에서 찾을 수 있는 정확한 문자열이어야 합니다.

[출력 형식 - JSON]
{
  "substitutions": [
    {
      "original": "원문에서의 정확한 표현",
      "replaced": "교체할 표현",
      "confidence": "high|medium|low",
      "reason": "추론 근거"
    }
  ]
}

반드시 JSON만 출력하세요. 마크다운 코드블록(```)을 포함하지 마세요.
annotated_text는 출력하지 마세요.
""".strip()


def resolve_law_references(case_text: str) -> dict:
    """LLM으로 모호한 법령명 교체 목록을 도출한다."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": f"다음 판례 원문을 처리해주세요:\n\n{case_text}"},
    ]
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "max_tokens": 10000,
        "temperature": 0.1,
    }

    response = requests.post(GMS_BASE_URL, headers=GMS_HEADERS, json=payload, timeout=60)
    response.raise_for_status()

    raw = response.json()["choices"][0]["message"]["content"].strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)

    # 중복 제거 (original 기준)
    seen = set()
    deduped = []
    for s in result.get("substitutions", []):
        key = s.get("original", "")
        if key not in seen:
            seen.add(key)
            deduped.append(s)
    result["substitutions"] = deduped

    return result


def apply_llm_substitutions(text: str, substitutions: list[dict]) -> tuple[str, bool]:
    """
    LLM 교체 목록을 원문에 적용한다.
    low confidence 항목이 있으면 has_low=True 반환.
    """
    has_low = any(s.get("confidence") == "low" for s in substitutions)
    for s in substitutions:
        text = text.replace(s["original"], s["replaced"])
    return text, has_low