import json
import os

import httpx

from app.core.exceptions import ServiceException
from app.schemas.common import LegalIssue, LegalIssueAnalysisResult
from app.schemas.enums import InputDocumentType, Status
from app.schemas.legal_issue_analysis import (
    LegalIssueAnalysisRequest,
    LegalIssueAnalysisResponse,
)

GMS_MESSAGES_URL = "https://gms.ssafy.io/gmsapi/api.anthropic.com/v1/messages"
LLM_MODEL = "claude-sonnet-4-5-20250929"
GMS_API_KEY_ENV = "GMS_KEY"

SYSTEM_PROMPT = """당신은 행정처분 사건의 법적 쟁점을 분석하는 법률 전문가다.
주어진 정보를 바탕으로 법적 쟁점만 분석하라.
전략 수립, 판례 활용, 인용 가능성 판단은 하지 않는다.
반드시 JSON 형식으로만 응답하고, JSON 외의 설명이나 마크다운은 포함하지 않는다."""


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
        "max_tokens": 2048,
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

    return f"""다음은 행정처분 사건 정보다.

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

{_buildAppealClaimContext(request)}

[관련 법령]
{lawRetrievalsText}

위 정보를 바탕으로 법적 쟁점을 분석하고 아래 JSON 형식으로 응답하라.

{{
  "legalIssueSummary": "전체 법적 쟁점 요약 (1~2문장)",
  "legalWeaknessFound": true 또는 false,
  "legalIssues": [
    {{
      "issueType": "사실오인 / 절차적하자 / 재량권 일탈·남용 중 하나",
      "description": "쟁점 설명",
      "lawBasis": "근거 법령",
      "basisText": "쟁점의 근거가 되는 사실 또는 진술",
      "riskLevel": "HIGH / MEDIUM / LOW 중 하나"
    }}
  ]
}}

추가 지침:
- issueType은 반드시 '사실오인', '절차적하자', '재량권 일탈·남용' 중 하나만 사용하라.
- legalIssues는 실제로 쟁점이 있는 경우에만 포함하고, 최대 3개까지만 작성하라.
- sourceDocumentType이 ANSWER이고 appealClaimContent가 주어졌다면, 이는 기존 청구서의 주장 맥락을 이해하기 위한 참고 정보다.
- 이 참고 정보는 답변서가 기존 청구서의 어떤 주장에 대응하거나 반박하는지 해석할 때만 사용하라.
- 법적 쟁점 분석의 주된 기준은 여전히 답변서 내용, 사건 경위, 관련 법령이다.
- 기존 청구서 주장에만 끌려가서 답변서 자체의 법적 약점을 놓치지 마라."""


def _buildAppealClaimContext(request: LegalIssueAnalysisRequest) -> str:
    if request.sourceDocumentType != InputDocumentType.ANSWER:
        return ""

    appealClaimContent = request.appealClaimContent
    if appealClaimContent is None:
        raise ServiceException(
            "appealClaimContent is required when sourceDocumentType is ANSWER"
        )

    preparedEvidenceText = ", ".join(appealClaimContent.preparedEvidenceList or [])

    return f"""[기존 행정심판 청구서 참고]
- 위 정보는 기존 청구서의 주장 맥락을 이해하기 위한 참고자료다.
- 위원회 유형: {appealClaimContent.committeeType or "미상"}
- 처분 내용 요약: {appealClaimContent.dispositionContent or "미상"}
- 청구 취지: {appealClaimContent.claimPurpose or "미상"}
- 청구 이유: {appealClaimContent.claimReason or "미상"}
- 불복절차고지 유무: {appealClaimContent.inform}
- 불복절차고지 내용: {appealClaimContent.informContent or "미상"}
- 인지일: {appealClaimContent.awareDate or "미상"}
- 처분청: {appealClaimContent.agencyName or "미상"}
- 기존 확보 증거: {preparedEvidenceText or "미상"}"""


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
