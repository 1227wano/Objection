import os
import base64
import json
import io
import httpx
from pathlib import Path

from app.core.exceptions import ServiceException
from app.schemas.common import (
    DocumentExtractResult,
    ParsedFields,
    NoticeTypeSpecific,
    AnswerTypeSpecific,
    DecisionTypeSpecific,
)
from app.schemas.document_extract import DocumentExtractRequest, DocumentExtractResponse
from app.schemas.enums import InputDocumentType, Stage, Status

GMS_RESPONSES_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/responses"
VISION_MODEL = "gpt-5.2-pro"
FILE_BASE_PATH = os.getenv("FILE_BASE_PATH", "/app/files")
GMS_API_KEY_ENV = "GMS_KEY"

MAX_IMAGE_SIZE = (800, 800)
JPEG_QUALITY = 70

DOCUMENT_TYPE_BY_STAGE = {
    Stage.APPEAL: InputDocumentType.NOTICE,
    Stage.ANSWER_RESPONSE: InputDocumentType.ANSWER,
    Stage.DECISION_REVIEW: InputDocumentType.DECISION,
}

SYSTEM_PROMPT = """당신은 한국 행정처분 문서를 분석하는 전문가입니다.
주어진 문서 이미지에서 정확하게 정보를 추출하고, 반드시 JSON 형식으로만 응답하세요.
JSON 외 다른 텍스트, 설명, 마크다운 코드블록은 절대 포함하지 마세요."""


def extractDocument(request: DocumentExtractRequest) -> DocumentExtractResponse:
    documentType = DOCUMENT_TYPE_BY_STAGE.get(request.stage)
    if documentType is None:
        raise ServiceException("failed to determine documentType from stage")

    fileBytes, mimeType = _loadFile(request.fileKey)
    extractionResult = _callVisionLLM(fileBytes, mimeType, documentType)

    return DocumentExtractResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="document extracted successfully",
        result=extractionResult,
        warnings=[],
    )


def _loadFile(fileKey: str) -> tuple[bytes, str]:
    filePath = Path(FILE_BASE_PATH) / fileKey
    if not filePath.exists():
        raise ServiceException(f"file not found: {fileKey}")

    suffix = filePath.suffix.lower()

    if suffix == ".pdf":
        return filePath.read_bytes(), "application/pdf"

    if suffix in (".jpg", ".jpeg", ".png"):
        try:
            from PIL import Image
        except ImportError:
            raise ServiceException("Pillow is not installed. Run: pip install Pillow")

        img = Image.open(filePath)
        if img.mode in ("RGBA", "P", "LA", "L"):
            img = img.convert("RGB")

        img.thumbnail(MAX_IMAGE_SIZE, Image.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return buffer.getvalue(), "image/jpeg"

    raise ServiceException(f"unsupported file type: {suffix}")


def _callVisionLLM(
        fileBytes: bytes,
        mimeType: str,
        documentType: InputDocumentType,
) -> DocumentExtractResult:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")

    base64File = base64.b64encode(fileBytes).decode("utf-8")

    payload = {
        "model": VISION_MODEL,
        "input": [
            {
                "role": "developer",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_image",
                        "image_url": f"data:{mimeType};base64,{base64File}",
                    },
                    {
                        "type": "input_text",
                        "text": _buildPrompt(documentType),
                    },
                ],
            },
        ],
    }

    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            response = client.post(
                GMS_RESPONSES_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {apiKey}",
                },
                json=payload,
            )
            response.raise_for_status()
            responseBody = response.json()
    except httpx.HTTPStatusError as exc:
        raise ServiceException(f"LLM API call failed: {exc.response.status_code} {exc.response.text}") from exc
    except httpx.RequestError as exc:
        raise ServiceException("LLM API request error") from exc

    return _parseResponse(responseBody, documentType)


def _buildPrompt(documentType: InputDocumentType) -> str:
    if documentType == InputDocumentType.NOTICE:
        typeSpecificPrompt = """    "typeSpecific": {
      "sanctionType": "영업정지 / 허가취소 / 과징금 등 또는 null",
      "sanctionDays": 처분 일수 숫자 또는 null,
      "legalBasis": ["근거 법조항 배열 (예: 식품위생법 제44조)"],
      "dispositionContent": "처분 내용 요약 또는 null"
    }"""
    elif documentType == InputDocumentType.ANSWER:
        typeSpecificPrompt = """    "typeSpecific": {
      "respondent": "피청구인(처분 기관) 또는 null",
      "answerSummary": "답변서 핵심 주장 요약 또는 null",
      "defensePoints": ["주요 방어 논거 배열"]
    }"""
    elif documentType == InputDocumentType.DECISION:
        typeSpecificPrompt = """    "typeSpecific": {
      "caseNumber": "사건번호 (예: 2026-행심-1234) 또는 null",
      "decisionResult": "인용 / 기각 / 각하 또는 null",
      "orderText": "주문 원문 또는 null",
      "reasonSummary": "재결 이유 요약 또는 null"
    }"""

    return f"""다음은 한국 행정처분 관련 문서입니다. 문서 종류는 {documentType.value}입니다.

아래 JSON 형식으로 정보를 추출하세요.

{{
  "isValidForStage": true 또는 false (문서 제목에 "사전통지서"가 포함된 경우 반드시 false),
  "invalidReason": null 또는 "사유 문자열" (isValidForStage가 false인 경우 이유 작성),
  "caseTitle": "사건 제목",
  "title": "문서 제목",
  "rawText": "문서 전체 원문을 그대로 입력",
  "summary": "문서를 1~2줄로 요약",
  "parsedFields": {{
    "disposalDate": "YYYY-MM-DD 형식 또는 null",
    "agencyName": "처분 기관명 또는 null",
    "claimant": "청구인(업주) 이름 또는 null",
    "businessName": "업소명 또는 null",
    "businessAddress": "업소 주소 또는 null",
{typeSpecificPrompt}
  }},
  "searchHints": ["판례 검색에 유용한 키워드를 5~10개 배열로"]
}}"""


def _parseResponse(
        responseBody: dict,
        documentType: InputDocumentType,
) -> DocumentExtractResult:
    try:
        messageOutput = next(
            item for item in responseBody["output"]
            if item.get("type") == "message"
        )
        content = messageOutput["content"][0]["text"]
        data = json.loads(content)
    except (KeyError, IndexError, StopIteration, json.JSONDecodeError) as exc:
        raise ServiceException(f"failed to parse LLM response: {responseBody}") from exc

    isValid = data.get("isValidForStage", True)
    parsedFieldsData = data.get("parsedFields", {})
    typeSpecificData = parsedFieldsData.pop("typeSpecific", None)

    if isValid and typeSpecificData:
        if documentType == InputDocumentType.NOTICE:
            typeSpecific = NoticeTypeSpecific(**typeSpecificData)
        elif documentType == InputDocumentType.ANSWER:
            typeSpecific = AnswerTypeSpecific(**typeSpecificData)
        elif documentType == InputDocumentType.DECISION:
            typeSpecific = DecisionTypeSpecific(**typeSpecificData)
        else:
            typeSpecific = None
    else:
        typeSpecific = None

    return DocumentExtractResult(
        documentType=documentType,
        isValidForStage=isValid,
        invalidReason=data.get("invalidReason") or None,
        caseTitle=data.get("caseTitle") or None,
        title=data.get("title") or None,
        rawText=data.get("rawText") or None,
        summary=data.get("summary") or None,
        parsedFields=ParsedFields(**parsedFieldsData, typeSpecific=typeSpecific) if isValid else ParsedFields(),
        searchHints=data.get("searchHints", []) if isValid else [],
    )