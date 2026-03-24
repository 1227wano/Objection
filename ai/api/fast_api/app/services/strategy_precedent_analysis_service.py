import json
import os

import httpx

from app.core.exceptions import ServiceException
from app.schemas.enums import Status
from app.schemas.strategy_precedent_analysis import (
    AppealPossibility,
    ClaimType,
    MainPoint,
    PrecedentInfo,
    StrategyPrecedentAnalysisRequest,
    StrategyPrecedentAnalysisResponse,
    StrategyPrecedentAnalysisResult,
)

GEMINI_API_URL = (
    "https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta/"
    "models/gemini-2.5-pro:generateContent"
)
STRATEGY_MODEL = os.getenv("STRATEGY_MODEL", "gemini-2.5-pro")
GMS_API_KEY_ENV = "GMS_KEY"

SYSTEM_PROMPT = """당신은 행정심판 전략/판례 활용 분석 전문가다.
입력으로 주어진 사건 정보, 법적 쟁점, 유사 판례만 바탕으로 전략을 정리한다.
반드시 JSON만 반환하고, 마크다운이나 설명 문장은 포함하지 않는다.
claimType은 CANCEL, INVALID, ORDER 중 하나만 사용한다.
appealPossibility는 H, M, L, Z 중 하나만 사용한다. (High, Medium, Low, Zero)
mainPoints는 최대 3개까지만 작성한다.
precedentInfos는 입력된 precedentRetrievals 범위 안에서만 작성한다."""


def analyzeStrategyPrecedent(
    request: StrategyPrecedentAnalysisRequest,
) -> StrategyPrecedentAnalysisResponse:
    responseData = _callStrategyLLM(request)
    result = _parseResult(responseData)

    return StrategyPrecedentAnalysisResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="strategy precedent analysis completed",
        result=result,
        warnings=[],
    )


def _callStrategyLLM(request: StrategyPrecedentAnalysisRequest) -> dict:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")

    prompt = f"{SYSTEM_PROMPT}\n\n{_buildPrompt(request)}"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt,
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
        },
    }

    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            response = client.post(
                GEMINI_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },
                json=payload,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        raise ServiceException(
            f"LLM API call failed: {exc.response.status_code} {exc.response.text}"
        ) from exc
    except httpx.RequestError as exc:
        raise ServiceException("LLM API request error") from exc
    except ValueError as exc:
        raise ServiceException("LLM API response is invalid") from exc


def _buildPrompt(request: StrategyPrecedentAnalysisRequest) -> str:
    requestJson = json.dumps(
        request.model_dump(mode="json"),
        ensure_ascii=False,
        indent=2,
    )

    return f"""다음 입력을 바탕으로 전략/판례 활용 분석 결과를 JSON으로 반환해라.

입력 필드 설명:
- sourceDocumentType: 입력 문서 종류
- caseInfo: 사건 기본 정보와 parsedFields/rawText
- caseContext.fact: 사용자가 주장하는 사실관계
- caseContext.opinion: 사용자가 느끼는 부당함 또는 의견
- legalIssueAnalysisResult: 법적 쟁점 분석 결과
- precedentRetrievals: 유사 판례 검색 결과

반환 JSON 형식:
{{
  "claimType": "CANCEL | INVALID | ORDER",
  "appealPossibility": "H | M | L | Z",
  "strategySummary": "전략 요약 또는 null",
  "mainPoints": [
    {{
      "point": "주장 포인트(1~3개 단어의 짧은 문장)",
      "reason": "이유 또는 null",
      "sourceText": "근거 문장(caseContext/precedentRetrievals[].summary/rawText 에서 추출) 또는 null"
    }}
  ],
  "stayRecommended": true,
  "precedentInfos": [
    {{
      "precedentNo": "판례 번호",
      "precedentName": "판례명",
      "summary": "판례 요약 또는 null",
      "matchReason": "유사성 설명 또는 null",
      "usagePoint": "활용 포인트 또는 null"
    }}
  ],
  "recommendedEvidence": ["증거 항목"]
}}

입력 JSON:
{requestJson}"""


def _parseResult(responseBody: dict) -> StrategyPrecedentAnalysisResult:
    try:
        candidates = responseBody["candidates"]
        firstCandidate = candidates[0]
        parts = firstCandidate["content"]["parts"]
        textParts = [
            part["text"]
            for part in parts
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ]
        content = _extractJsonText("".join(textParts))
        data = json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise ServiceException(f"failed to parse LLM response: {responseBody}") from exc

    mainPoints = [MainPoint(**item) for item in (data.get("mainPoints") or [])]
    precedentInfos = [
        PrecedentInfo(**item) for item in (data.get("precedentInfos") or [])
    ]
    recommendedEvidence = data.get("recommendedEvidence")

    claimType = _parseClaimType(data.get("claimType"))
    appealPossibility = _parseAppealPossibility(data.get("appealPossibility"))

    if recommendedEvidence is not None:
        if not isinstance(recommendedEvidence, list):
            raise ServiceException("LLM response recommendedEvidence is invalid")
        if not all(isinstance(item, str) for item in recommendedEvidence):
            raise ServiceException("LLM response recommendedEvidence is invalid")

    return StrategyPrecedentAnalysisResult(
        claimType=claimType,
        appealPossibility=appealPossibility,
        strategySummary=data.get("strategySummary"),
        mainPoints=mainPoints or None,
        stayRecommended=_parseOptionalBool(data.get("stayRecommended")),
        precedentInfos=precedentInfos or None,
        recommendedEvidence=recommendedEvidence,
    )


def _parseClaimType(value: object) -> ClaimType:
    if not isinstance(value, str):
        raise ServiceException("LLM response claimType is invalid")

    normalized = value.strip().upper()
    try:
        return ClaimType(normalized)
    except ValueError as exc:
        raise ServiceException("LLM response claimType is invalid") from exc


def _parseAppealPossibility(value: object) -> AppealPossibility:
    if not isinstance(value, str):
        raise ServiceException("LLM response appealPossibility is invalid")

    normalized = value.strip().upper()
    aliases = {
        "HIGH": AppealPossibility.HIGH,
        "MEDIUM": AppealPossibility.MEDIUM,
        "LOW": AppealPossibility.LOW,
        "UNKNOWN": AppealPossibility.ZERO,
    }
    if normalized in aliases:
        return aliases[normalized]

    try:
        return AppealPossibility(normalized)
    except ValueError as exc:
        raise ServiceException("LLM response appealPossibility is invalid") from exc


def _parseOptionalBool(value: object) -> bool | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    raise ServiceException("LLM response stayRecommended is invalid")


def _extractJsonText(text: str) -> str:
    stripped = text.strip()

    if stripped.startswith("```"):
        lines = stripped.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines).strip()

    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or start > end:
        raise ServiceException("LLM response does not contain valid JSON")

    return stripped[start : end + 1]
