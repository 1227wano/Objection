import os
import json
import httpx

from app.core.exceptions import ServiceException
from app.schemas.common import LegalIssue, LegalIssueAnalysisResult
from app.schemas.enums import Status
from app.schemas.legal_issue_analysis import (
    LegalIssueAnalysisRequest,
    LegalIssueAnalysisResponse,
)

GMS_MESSAGES_URL = "https://gms.ssafy.io/gmsapi/api.anthropic.com/v1/messages"
LLM_MODEL = "claude-sonnet-4-5-20250929"
GMS_API_KEY_ENV = "GMS_KEY"

SYSTEM_PROMPT = """당신은 한국 행정처분 사건을 분석하는 법률 전문가입니다.
주어진 정보를 바탕으로 법적 쟁점만 분석하세요. 전략, 판례 활용, 인용 가능성 판단은 하지 않습니다.
반드시 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트, 설명, 마크다운 코드블록은 절대 포함하지 마세요."""


def analyzeLegalIssue(
        request: LegalIssueAnalysisRequest,
) -> LegalIssueAnalysisResponse:
    analysisResult = _callLLM(request)

    return LegalIssueAnalysisResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="legal issue analysis completed",
        result=analysisResult,
        warnings=[],
    )


def _callLLM(request: LegalIssueAnalysisRequest) -> LegalIssueAnalysisResult:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")

    payload = {
        "model": LLM_MODEL,
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": _buildPrompt(request),
            }
        ],
    }

    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            response = client.post(
                GMS_MESSAGES_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
                json=payload,
            )
            response.raise_for_status()
            responseBody = response.json()
    except httpx.HTTPStatusError as exc:
        raise ServiceException(
            f"LLM API call failed: {exc.response.status_code} {exc.response.text}"
        ) from exc
    except httpx.RequestError as exc:
        raise ServiceException("LLM API request error") from exc

    return _parseResponse(responseBody, request)


def _buildPrompt(request: LegalIssueAnalysisRequest) -> str:
    caseInfo = request.caseInfo
    caseContext = request.caseContext

    lawRetrievalsText = "\n".join(
        f"- {lr.lawName} {lr.articleNo}: {lr.provisionText}"
        for lr in request.lawRetrievals
    )

    return f"""다음은 한국 행정처분 사건 정보입니다.

[문서 종류]
{request.sourceDocumentType.value}

[처분 정보]
- 처분청: {caseInfo.agencyName or "미상"}
- 처분 종류: {caseInfo.sanctionType or "미상"}
- 처분 내용: {caseInfo.sanctionValue or "미상"}
- 처분일: {caseInfo.disposalDate or "미상"}
- 문서 원문: {caseInfo.rawText or "없음"}

[사건 경위 및 의견]
- 경위: {caseContext.fact}
- 의견: {caseContext.opinion}

[관련 법령]
{lawRetrievalsText}

위 정보를 바탕으로 법적 쟁점을 분석하고 아래 JSON 형식으로 응답하세요.

{{
  "legalIssueSummary": "전체 법적 쟁점 요약 (1~2문장)",
  "legalWeaknessFound": true 또는 false,
  "legalIssues": [
    {{
      "issueType": "사실오인 / 절차적하자 / 재량권일탈남용 중 하나",
      "description": "쟁점 설명",
      "lawBasis": "근거 법령 (예: 식품위생법 제44조)",
      "basisText": "근거가 되는 사실 또는 진술",
      "riskLevel": "HIGH / MEDIUM / LOW 중 하나"
    }}
  ]
}}

issueType은 반드시 '사실오인', '절차적하자', '재량권일탈남용' 세 가지 중 하나만 사용하세요.
legalIssues는 실제로 쟁점이 있는 경우에만 포함하고, 최대 3개까지만 작성하세요."""


def _parseResponse(
        responseBody: dict,
        request: LegalIssueAnalysisRequest,
) -> LegalIssueAnalysisResult:
    try:
        content = responseBody["content"][0]["text"]
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```", 2)[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
        data = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise ServiceException(f"failed to parse LLM response: {responseBody}") from exc

    legalIssues = [
        LegalIssue(
            issueType=issue["issueType"],
            description=issue["description"],
            lawBasis=issue["lawBasis"],
            basisText=issue["basisText"],
            riskLevel=issue["riskLevel"],
        )
        for issue in data.get("legalIssues", [])
    ]

    return LegalIssueAnalysisResult(
        sourceDocumentType=request.sourceDocumentType,
        legalIssueSummary=data["legalIssueSummary"],
        legalWeaknessFound=data["legalWeaknessFound"],
        legalIssues=legalIssues,
    )