import json
import os

import httpx

from app.core.exceptions import ServiceException
from app.schemas.enums import InputDocumentType, Status
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

SYSTEM_PROMPT = """당신은 행정심판 전략 및 판례 활용 분석 전문가다.
입력으로 주어진 사건 정보, 법적 쟁점, 유사 판례를 바탕으로 가장 적절한 전략을 정리한다.
반드시 JSON만 반환하고, 설명 문장이나 마크다운은 포함하지 않는다.
claimType은 CANCEL, INVALID, ORDER 중 하나만 사용한다.
appealPossibility는 H, M, L, Z 중 하나만 사용한다.
mainPoints는 최대 3개까지만 작성한다.
precedentInfos는 반드시 입력된 precedentRetrievals 범위 안에서만 작성한다."""


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

    return f"""다음 입력을 바탕으로 전략 및 판례 활용 분석 결과를 JSON으로 반환하라.

입력 필드 설명:
- sourceDocumentType: 입력 문서 종류
- caseInfo: 사건 기본 정보와 parsedFields/rawText
- caseContext.fact: 사용자가 주장하는 사실관계
- caseContext.opinion: 사용자의 의견 또는 불복 취지
- legalIssueAnalysisResult: 법적 쟁점 분석 결과
- precedentRetrievals: 유사 판례 검색 결과
- appealClaimContent: sourceDocumentType이 ANSWER일 때만 주어지는 기존 청구서 참고 정보

전략 판단 지침:
- sourceDocumentType이 ANSWER이고 appealClaimContent가 주어졌다면, 기존 청구서의 주장 방향과 준비된 증거를 참고해 전략의 정합성을 함께 판단하라.
- 이때 보충서면 방향이 답변서 주장에 대한 반박 중심인지, 새로운 주장 보강 중심인지, 또는 혼합형인지 내부적으로 판단하라.
- 위 내부 판단 결과는 별도 필드로 출력하지 말고 strategySummary와 mainPoints에 자연스럽게 반영하라.
- 다만 기존 청구서 내용은 참고 정보일 뿐이며, 법적 쟁점 분석 결과와 판례에 비추어 더 적절한 전략이 있다면 그에 따라 판단하라.
- 기존 청구서 내용을 단순 반복하거나 방어하는 데 그치지 말고, 현재 입력 기준으로 가장 적절한 전략을 제시하라.

반환 JSON 형식:
{{
  "claimType": "CANCEL | INVALID | ORDER",
  "appealPossibility": "H | M | L | Z",
  "strategySummary": "전략 요약 또는 null",
  "mainPoints": [
    {{
      "point": "주장 포인트(1~3 단어로 표현)",
      "reason": "이유 또는 null",
      "sourceText": "근거 문장(caseContext, precedentRetrievals[].summary, rawText, appealClaimContent 중에서 추출) 또는 null"
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
