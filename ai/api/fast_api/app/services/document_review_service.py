import json
import os

import httpx

from app.core.exceptions import ServiceException
from app.schemas.common import (
    DocumentReviewResult,
    DraftDocument,
    DraftDocumentContent,
    ReviewError,
)
from app.schemas.document_review import DocumentReviewRequest, DocumentReviewResponse
from app.schemas.enums import OutputDocumentType, Status

GMS_MESSAGES_URL = "https://gms.ssafy.io/gmsapi/api.anthropic.com/v1/messages"
LLM_MODEL = "claude-sonnet-4-20250514"
GMS_API_KEY_ENV = "GMS_KEY"

SYSTEM_PROMPT = """당신은 한국 행정심판 문서를 검증하는 법률 감수 전문가입니다.
당신의 임무는 AI가 작성한 행정심판 청구서 또는 보충서면 초안을 비판적으로 검토하는 것입니다.

검증 기준:
1. 사실관계 정합성: 처분 정보(처분청, 처분 종류, 처분 수위)가 문서에 정확히 반영되었는가
2. 법적 쟁점 반영: 법적 쟁점 분석(legalIssues)의 핵심 쟁점이 문서에 빠짐없이 포함되었는가
3. 전략 정합성: 전략/판례 분석의 주장 포인트(mainPoints)가 문서에 적절히 녹아들었는가
4. 논리적 일관성: 청구 취지와 청구 이유 간 논리적 모순이 없는가
5. 증거 정합성: 언급된 증거가 실제 제출 가능한 증거 목록과 일치하는가
6. 법령 정확성: 인용된 법령명, 조항 번호가 정확한가
7. 형식 적절성: 행정심판 문서로서 적절한 표현과 구조를 갖추었는가

검증 후 오류가 있으면 수정된 문서를 함께 반환하세요.
반드시 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트, 설명, 마크다운 코드블록은 절대 포함하지 마세요."""


def reviewDocument(request: DocumentReviewRequest) -> DocumentReviewResponse:
    reviewResult = _callLLM(request)

    return DocumentReviewResponse(
        status=Status.SUCCESS,
        message="document review completed",
        result=reviewResult,
        warnings=[],
    )


def _callLLM(request: DocumentReviewRequest) -> DocumentReviewResult:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")

    payload = {
        "model": LLM_MODEL,
        "max_tokens": 4096,
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


def _buildPrompt(request: DocumentReviewRequest) -> str:
    caseInfo = request.caseInfo
    draft = request.draftDocument
    legalResult = request.legalIssueAnalysisResult
    strategyResult = request.strategyPrecedentAnalysisResult

    legalIssuesText = "\n".join(
        f"  - [{issue.issueType}] {issue.description} "
        f"(근거: {issue.lawBasis}, 위험도: {issue.riskLevel})"
        for issue in legalResult.legalIssues
    )

    mainPointsText = "\n".join(
        f"  - 포인트: {mp.point} / 이유: {mp.reason} / 근거: {mp.sourceText}"
        for mp in strategyResult.mainPoints
    )

    precedentInfosText = "\n".join(
        f"  - {pi.precedentNo} ({pi.precedentName}): "
        f"유사성={pi.matchReason}, 활용={pi.usagePoint}"
        for pi in strategyResult.precedentInfos
    )

    evidenceText = (
        ", ".join(request.preparedEvidenceList)
        if request.preparedEvidenceList
        else "없음"
    )

    documentTypeLabel = (
        "행정심판청구서"
        if request.documentType == OutputDocumentType.APPEAL_CLAIM
        else "보충서면"
    )

    return f"""다음은 AI가 작성한 {documentTypeLabel} 초안과 그 근거가 된 분석 결과입니다.
초안을 비판적으로 검토하고 오류/누락/논리 불일치를 점검하세요.

=== 문서 종류 ===
{request.documentType.value} ({documentTypeLabel})

=== 처분 기본 정보 ===
- 처분청: {caseInfo.agencyName}
- 사업장명: {caseInfo.businessName}
- 사업장 주소: {caseInfo.businessAddress}
- 처분 종류: {caseInfo.sanctionType}
- 처분 수위: {caseInfo.sanctionValue or "미상"}
- 청구 유형: {caseInfo.claimType}

=== A-1 법적 쟁점 분석 결과 ===
- 문서 종류: {legalResult.sourceDocumentType.value}
- 쟁점 요약: {legalResult.legalIssueSummary}
- 법적 약점 발견: {legalResult.legalWeaknessFound}
- 쟁점 목록:
{legalIssuesText}

=== A-2 전략/판례 분석 결과 ===
- 청구 유형: {strategyResult.claimType}
- 인용 가능성: {strategyResult.appealPossibility}
- 전략 요약: {strategyResult.strategySummary}
- 주장 포인트:
{mainPointsText}
- 활용 판례:
{precedentInfosText}
- 집행정지 권고: {strategyResult.stayRecommended}
- 추천 증거: {", ".join(strategyResult.recommendedEvidence)}

=== 제출 예정 증거 ===
{evidenceText}

=== 검토 대상 문서 초안 ===
- 제목: {draft.title}
- 청구 취지: {draft.contentJson.claimPurpose}
- 청구 이유: {draft.contentJson.claimReason}
- 사실관계 요약: {draft.contentJson.factSummary}
- 법적 주장: {json.dumps(draft.contentJson.legalArguments, ensure_ascii=False)}
- 증거 목록: {json.dumps(draft.contentJson.evidenceList, ensure_ascii=False)}

위 정보를 대조하여 문서를 검증하고 아래 JSON 형식으로 응답하세요.

{{
  "verification": "전체 검증 결과 요약 (2~3문장)",
  "needsRewrite": true 또는 false,
  "errors": [
    {{
      "field": "오류가 있는 필드명 (claimPurpose / claimReason / factSummary / legalArguments / evidenceList)",
      "reason": "오류 사유",
      "suggestion": "구체적 수정 제안"
    }}
  ],
  "revisedTitle": "수정된 제목 (수정 불필요시 원본 그대로)",
  "revisedContentJson": {{
    "claimPurpose": "수정된 청구 취지 (수정 불필요시 원본 그대로)",
    "claimReason": "수정된 청구 이유 (수정 불필요시 원본 그대로)",
    "factSummary": "수정된 사실관계 요약 (수정 불필요시 원본 그대로)",
    "legalArguments": ["수정된 법적 주장 목록"],
    "evidenceList": ["수정된 증거 목록"]
  }}
}}

검증 규칙:
- errors는 실제 오류가 있는 경우에만 포함하세요.
- needsRewrite는 errors가 하나라도 있으면 true입니다.
- revisedContentJson은 needsRewrite 여부와 관계없이 항상 포함하세요.
- 오류가 없으면 revisedContentJson에 원본 내용을 그대로 넣으세요.
- 수정 시 행정심판 문서에 적합한 법률 용어와 문체를 유지하세요.
- A-1의 쟁점이 문서에 반영되지 않았다면 반드시 오류로 지적하세요.
- A-2의 주장 포인트가 누락되었다면 반드시 오류로 지적하세요."""


def _parseResponse(
        responseBody: dict,
        request: DocumentReviewRequest,
) -> DocumentReviewResult:
    try:
        content = responseBody["content"][0]["text"]
        content = _extractJsonText(content)
        data = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise ServiceException(
            f"failed to parse LLM response: {responseBody}"
        ) from exc

    errors = [
        ReviewError(
            field=err["field"],
            reason=err["reason"],
            suggestion=err["suggestion"],
        )
        for err in data.get("errors", [])
    ]

    needsRewrite = data.get("needsRewrite", len(errors) > 0)

    revisedContent = data.get("revisedContentJson", {})
    originalContent = request.draftDocument.contentJson

    try:
        contentJson = DraftDocumentContent(
            claimPurpose=revisedContent.get(
                "claimPurpose", originalContent.claimPurpose
            ),
            claimReason=revisedContent.get(
                "claimReason", originalContent.claimReason
            ),
            factSummary=revisedContent.get(
                "factSummary", originalContent.factSummary
            ),
            legalArguments=revisedContent.get(
                "legalArguments", originalContent.legalArguments
            ),
            evidenceList=revisedContent.get(
                "evidenceList", originalContent.evidenceList
            ),
        )
    except Exception:
        contentJson = originalContent

    revisedTitle = data.get("revisedTitle", request.draftDocument.title)
    verification = data.get("verification", "검증 완료")

    return DocumentReviewResult(
        analysisNo=request.analysisNo,
        documentType=request.documentType,
        verification=verification,
        needsRewrite=needsRewrite,
        errors=errors,
        draftDocument=DraftDocument(
            title=revisedTitle,
            contentJson=contentJson,
        ),
    )


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

    return stripped[start: end + 1]