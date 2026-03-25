import json
import os

import httpx

from app.core.exceptions import ServiceException
from app.schemas.document_draft import (
    AppealClaimContentJson,
    DocumentDraftRequest,
    DocumentDraftResponse,
    DocumentDraftResult,
    OutputDocumentType,
    SupplementStatementContentJson,
)
from app.schemas.enums import Status

OPENAI_CHAT_COMPLETIONS_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
DRAFT_MODEL = os.getenv("DRAFT_MODEL", "gpt-5.2")
GMS_API_KEY_ENV = "GMS_KEY"

SYSTEM_PROMPT = """당신은 행정심판 문서 작성 전문가다.
입력으로 주어진 사건 정보, 법적 쟁점 분석, 전략 분석, 준비 증거를 바탕으로 문서 초안을 작성한다.
문체는 법률 문서답게 명료하고 정제된 문장으로 작성한다.
반드시 JSON만 반환하고, 마크다운이나 설명 문장은 포함하지 않는다.
documentType이 APPEAL_CLAIM이면 contentJson에는 committeeType, dispositionContent, claimPurpose, claimReason만 반환한다.
documentType이 SUPPLEMENT_STATEMENT이면 contentJson에는 submissionContent만 반환한다.
committeeType은 입력 정보만으로 특정 가능한 경우에만 실제 소관 행정심판위원회 명칭을 작성한다.
placeholder, 예시명, 임의의 기관명은 사용하지 않는다.
정확한 위원회 명칭을 특정할 수 없으면 반드시 null을 반환한다."""


def createDocumentDraft(request: DocumentDraftRequest) -> DocumentDraftResponse:
    responseData = _callDraftLLM(request)
    result = _parseResult(responseData, request)

    return DocumentDraftResponse(
        status=Status.SUCCESS,
        message="document draft created",
        result=result,
        warnings=[],
    )


def _callDraftLLM(request: DocumentDraftRequest) -> dict:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")

    payload = {
        "model": DRAFT_MODEL,
        "messages": [
            {
                "role": "developer",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": _buildPrompt(request),
            },
        ],
        "response_format": {
            "type": "json_object",
        },
    }

    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            response = client.post(
                OPENAI_CHAT_COMPLETIONS_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {apiKey}",
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


def _buildPrompt(request: DocumentDraftRequest) -> str:
    requestJson = json.dumps(
        request.model_dump(mode="json"),
        ensure_ascii=False,
        indent=2,
    )

    commonInstructions = """작성 지침:
- 입력에 없는 사실을 임의로 추가하지 않는다.
- legalIssueAnalysisResult와 strategyPrecedentAnalysisResult를 직접 근거로 사용한다.
- preparedEvidenceList가 있으면 문서 논리에 자연스럽게 반영하되, 확인되지 않은 증거 내용은 단정하지 않는다.
- 법률 문서답게 명료하고 단정적인 문장으로 작성한다.
- appealPossibility는 참고만 하고 출력 문구에는 직접 쓰지 않는다.
- committeeType은 request 정보만으로 특정 가능한 경우에만 작성한다.
- placeholder, 예시명, 추상적 범주명은 사용하지 않는다.
- 정확한 실제 위원회 명칭이 특정되지 않으면 committeeType은 null로 둔다.
- dispositionContent는 rawText에서 확인 가능한 처분 일자, 처분 주체, 처분 내용, 근거 법령만 사용해 객관적으로 정리한다.
- dispositionContent에 확인되지 않은 정보는 보충하지 않는다."""

    if request.documentType == OutputDocumentType.APPEAL_CLAIM:
        documentDescription = """문서 성격:
- 이 문서는 행정심판 청구서 초안이다.
- 행정청의 처분 또는 부작위에 대해 취소, 무효확인, 의무이행을 구하는 본안 청구 문서다.
- 처분 내용을 객관적으로 특정하고, 청구취지와 청구이유를 명확하고 단정적인 문장으로 제시해야 한다.
- claimPurpose는 결론형 문장으로 작성하고, claimReason은 핵심 위법사유와 주요 사정을 간결하게 정리한다."""
        responseShape = """{
  "contentJson": {
    "committeeType": "실제 소관 행정심판위원회 명칭 | null",
    "dispositionContent": "처분 내용 또는 부작위 내용",
    "claimPurpose": "청구 취지",
    "claimReason": "청구 이유"
  }
}"""
    else:
        documentDescription = """문서 성격:
- 이 문서는 보충서면 초안이다.
- 이미 제출된 청구서의 주장을 보강하고, 사실관계, 법리, 판례, 증거를 추가 설명하는 문서다.
- 독립적인 청구취지를 새로 만들기보다 기존 청구 취지를 뒷받침하는 보강 논리를 중심으로 작성한다.
- submissionContent는 사실관계 보강, 법적 쟁점 보강, 판례 활용, 증거 언급이 자연스럽게 이어지는 서면 본문으로 작성한다."""
        responseShape = """{
  "contentJson": {
    "submissionContent": "보충서면 본문"
  }
}"""

    return f"""다음 입력을 바탕으로 documentType에 맞는 문서 초안을 JSON으로 반환하라.

{documentDescription}

{commonInstructions}

반환 JSON 형식:
{responseShape}

입력 JSON:
{requestJson}"""


def _parseResult(
    responseBody: dict,
    request: DocumentDraftRequest,
) -> DocumentDraftResult:
    try:
        choices = responseBody["choices"]
        firstChoice = choices[0]
        message = firstChoice["message"]
        content = _extractJsonText(message["content"])
        data = json.loads(content)
        contentJson = data["contentJson"]
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise ServiceException(f"failed to parse LLM response: {responseBody}") from exc

    if request.documentType == OutputDocumentType.APPEAL_CLAIM:
        parsedContent = AppealClaimContentJson(**contentJson)
        _validateCommitteeType(parsedContent.committeeType)
    else:
        parsedContent = SupplementStatementContentJson(**contentJson)

    return DocumentDraftResult(
        analysisNo=request.analysisNo,
        documentType=request.documentType,
        contentJson=parsedContent,
    )


def _validateCommitteeType(value: str | None) -> None:
    if value is None:
        return
    if not isinstance(value, str):
        raise ServiceException("LLM response committeeType is invalid")
    if not value.strip():
        raise ServiceException("LLM response committeeType is invalid")


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

    return stripped[start:end + 1]
