import os
import base64
import json
import io
import logging
import httpx
import pdfplumber
from pathlib import Path

from app.core.exceptions import ServiceException
from app.schemas.common import (
    DocumentExtractResult,
    NoticeParsedFields,
    AnswerParsedFields,
    DecisionParsedFields,
)
from app.schemas.document_extract import DocumentExtractRequest, DocumentExtractResponse
from app.schemas.enums import InputDocumentType, Status

logger = logging.getLogger(__name__)

# -----------------------------------------------
# 설정
# -----------------------------------------------

GMS_CHAT_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
GMS_API_KEY_ENV = "GMS_KEY"
FILE_BASE_PATH = os.getenv("FILE_BASE_PATH", "/app/files")

# Step 1: OCR — 이미지에서 텍스트만 추출 (Vision, gpt-4o-mini)
OCR_MODEL = "gpt-4o"
# Step 2: 필드 매핑 — 텍스트에서 구조화된 JSON 추출 (Text, gpt-4.1-mini)
MAPPING_MODEL = "gpt-4.1-mini"

MAX_IMAGE_SIZE = (1000, 1000)
JPEG_QUALITY = 70

# -----------------------------------------------
# Step 1 프롬프트 — OCR 전용
# -----------------------------------------------

OCR_SYSTEM_PROMPT = """\
당신은 한국어 문서 OCR 전문가입니다.
주어진 문서 이미지의 텍스트를 빠짐없이 정확하게 추출하세요.

규칙:
1. 표(테이블) 구조는 각 셀을 [항목명]: [내용] 형식으로 변환하세요.
2. 줄바꿈과 문단 구분을 유지하세요.
3. 마스킹/가림 처리된 부분은 [마스킹] 으로 표기하세요.
4. 도장/직인은 무시하세요.
5. 추출한 텍스트만 출력하세요. 설명이나 주석을 추가하지 마세요."""

OCR_USER_PROMPT = "이 문서의 모든 텍스트를 정확하게 추출하세요."

# -----------------------------------------------
# Step 2 프롬프트 — 필드 매핑 전용
# -----------------------------------------------

MAPPING_SYSTEM_PROMPT = """\
당신은 한국 행정처분 문서 분석 전문가입니다.
주어진 문서 텍스트를 분석하여 반드시 JSON 형식으로만 응답하세요.
JSON 외 다른 텍스트, 설명, 마크다운 코드블록은 절대 포함하지 마세요."""


# -----------------------------------------------
# 메인 로직
# -----------------------------------------------

def extractDocument(request: DocumentExtractRequest) -> DocumentExtractResponse:
    documentType = request.sourceDocumentType
    apiKey = _getApiKey()
    fileBytes, mimeType = _loadFile(request.fileUrl)

    if mimeType == "application/pdf":
        # PDF → 텍스트 직접 추출 (OCR 스킵)
        rawText = _extractTextFromPdf(fileBytes)
    else:
        # 이미지 → OCR : 이미지 → rawText (gpt-4o)
        rawText = _step1Ocr(fileBytes, mimeType, apiKey)
        logger.info("Step 1 OCR completed: %d chars extracted", len(rawText))

    # Step 2: 필드 매핑 — rawText → 구조화된 결과 (gpt-4.1-mini)
    extractionResult = _step2Mapping(rawText, documentType, apiKey)
    logger.info("Step 2 Mapping completed: type=%s, valid=%s",
                extractionResult.sourceDocumentType, extractionResult.isValidForStage)

    return DocumentExtractResponse(
        caseNo=request.caseNo,
        # govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="document extracted successfully",
        result=extractionResult,
        warnings=[],
    )


# -----------------------------------------------
# Step 1: OCR (gpt-4o-mini, chat/completions, role=developer)
# -----------------------------------------------
def _extractTextFromPdf(fileBytes: bytes) -> str:
    """PDF에서 텍스트를 직접 추출한다."""
    with pdfplumber.open(io.BytesIO(fileBytes)) as pdf:
        pages = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    if not pages:
        raise ServiceException("PDF에서 텍스트를 추출할 수 없습니다")
    return "\n\n".join(pages)

def _step1Ocr(fileBytes: bytes, mimeType: str, apiKey: str) -> str:
    """이미지에서 rawText만 추출한다."""
    base64File = base64.b64encode(fileBytes).decode("utf-8")

    payload = {
        "model": OCR_MODEL,
        "messages": [
            {
                "role": "developer",
                "content": OCR_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mimeType};base64,{base64File}",
                        },
                    },
                    {
                        "type": "text",
                        "text": OCR_USER_PROMPT,
                    },
                ],
            },
        ],
    }

    responseBody = _callGms(payload, apiKey, stepName="OCR")
    return _extractTextFromChatResponse(responseBody, stepName="OCR")


# -----------------------------------------------
# Step 2: 필드 매핑 (gpt-4.1-mini, chat/completions, role=system)
# -----------------------------------------------

def _step2Mapping(
        rawText: str,
        documentType: InputDocumentType,
        apiKey: str,
) -> DocumentExtractResult:
    """rawText에서 구조화된 필드를 추출한다."""
    userPrompt = _buildMappingPrompt(rawText, documentType)

    payload = {
        "model": MAPPING_MODEL,
        "messages": [
            {
                "role": "system",
                "content": MAPPING_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": userPrompt,
            },
        ],
        "max_tokens": 4096,
        "temperature": 0.3,
    }

    responseBody = _callGms(payload, apiKey, stepName="Mapping")
    jsonText = _extractTextFromChatResponse(responseBody, stepName="Mapping")

    return _parseMappingResult(jsonText, rawText, documentType)


def _buildMappingPrompt(rawText: str, documentType: InputDocumentType) -> str:
    """문서 종류별 매핑 프롬프트를 생성한다."""

    if documentType == InputDocumentType.NOTICE:
        fieldsSpec = """\
    "disposalDate": "YYYY-MM-DD 형식. 처분일자/행정처분일/처분 시작일. 없으면 null",
    "agencyName": "처분 기관명 (예: 서울특별시 강남구청). 문서 하단 발신자 참고. 없으면 null",
    "sanctionType": "영업정지 / 과징금 / 영업허가취소 / 영업폐쇄명령 중 정확히 하나. 없으면 null",
    "sanctionValue": "영업정지·폐쇄명령이면 일수(숫자), 과징금이면 금액(원, 숫자), 허가취소면 null",
    "businessName": "업소명/상호. 없으면 null",
    "businessAddress": "업소 소재지 주소. 없으면 null",
    "title": "이 사건을 한 줄로 요약한 제목 (AI 생성)",
    "Inform": "불복절차 안내/고지 내용이 있으면 true, 없으면 false",
    "InformContent": "불복절차 고지 내용 전문. 없으면 null",
    "legalBasis": ["근거 법조항 배열. 예: '식품위생법 제44조', '음악산업진흥에관한법률 제22조'"],
    "etc": {"문서에서 추출한 기타 주요 정보": "문자열 값만 가능. 리스트/배열/객체 절대 금지. 여러 항목은 쉼표로 구분한 하나의 문자열로 작성"}"""

    elif documentType == InputDocumentType.ANSWER:
        fieldsSpec = """\
    "caseNum": "사건번호 (예: 2026-01234). 없으면 null",
    "caseName": "사건명. 없으면 null",
    "legalBasis": ["근거 법조항 배열"],
    "etc": {"기타 주요 정보": "값"}"""

    elif documentType == InputDocumentType.DECISION:
        fieldsSpec = """\
    "etc": {"주문 내용, 청구 취지, 근거 법조 등 주요 정보": "값"}"""

    else:
        fieldsSpec = '"etc": {}'

    return f"""\
다음은 한국 행정처분 관련 문서({documentType.value})의 OCR 추출 텍스트입니다.

<document>
{rawText}
</document>

위 텍스트를 분석하여 아래 JSON 형식으로 정보를 추출하세요.

판단 기준:
- "사전통지서", "의견제출", "처분하고자 하는 내용" 등의 표현이 있으면 사전통지서입니다 → isValidForStage: false
- "처분통지서", "처분명령서", "행정처분명령서" 등은 정식 처분 문서입니다 → isValidForStage: true

응답 JSON:
{{
  "isValidForStage": true/false,
  "invalidReason": null 또는 "사전통지서로 판단됨" 등 사유,
  "summary": "문서를 1~2줄로 요약",
  "parsedFields": {{
{fieldsSpec}
  }}
}}"""


# -----------------------------------------------
# GMS API 공통 호출 (chat/completions)
# -----------------------------------------------

def _callGms(payload: dict, apiKey: str, stepName: str) -> dict:
    """GMS Chat Completions API를 호출하고 응답 body를 반환한다."""
    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            response = client.post(
                GMS_CHAT_URL,
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
            f"[{stepName}] LLM API call failed: {exc.response.status_code} {exc.response.text}"
        ) from exc
    except httpx.RequestError as exc:
        raise ServiceException(f"[{stepName}] LLM API request error") from exc


def _extractTextFromChatResponse(responseBody: dict, stepName: str) -> str:
    """chat/completions 응답에서 텍스트를 추출한다. (choices[0].message.content)"""
    try:
        return responseBody["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise ServiceException(
            f"[{stepName}] failed to extract text from response: {responseBody}"
        ) from exc


# -----------------------------------------------
# 파일 로딩
# -----------------------------------------------

def _loadFile(fileUrl: str) -> tuple[bytes, str]:
    filePath = Path(FILE_BASE_PATH) / fileUrl
    if not filePath.exists():
        raise ServiceException(f"file not found: {fileUrl}")

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


# -----------------------------------------------
# API Key
# -----------------------------------------------

def _getApiKey() -> str:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")
    return apiKey


# -----------------------------------------------
# Step 2 응답 파싱
# -----------------------------------------------

def _parseMappingResult(
        jsonText: str,
        rawText: str,
        documentType: InputDocumentType,
) -> DocumentExtractResult:
    """Step 2 매핑 결과 JSON을 파싱하여 DocumentExtractResult로 변환한다."""

    # JSON 파싱 (코드블록 감싸기 대응)
    cleanText = jsonText.strip()
    if cleanText.startswith("```"):
        cleanText = cleanText.split("\n", 1)[-1]
    if cleanText.endswith("```"):
        cleanText = cleanText.rsplit("```", 1)[0]
    cleanText = cleanText.strip()

    try:
        data = json.loads(cleanText)
    except json.JSONDecodeError as exc:
        raise ServiceException(
            f"[Mapping] failed to parse JSON: {jsonText[:500]}"
        ) from exc

    isValid = data.get("isValidForStage", True)
    rawParsedFields = data.get("parsedFields", {})

    # rawParsedFields 가져온 직후에
    etc = rawParsedFields.get("etc", {})
    if isinstance(etc, str):
        rawParsedFields["etc"] = {"info": etc}
    elif isinstance(etc, list):
        rawParsedFields["etc"] = {f"item_{i}": str(v) for i, v in enumerate(etc)}
    elif isinstance(etc, dict):
        rawParsedFields["etc"] = {k: str(v) if not isinstance(v, str) else v for k, v in etc.items()}
    else:
        rawParsedFields["etc"] = {}

    if isValid:
        if documentType == InputDocumentType.NOTICE:
            parsedFields = NoticeParsedFields(**rawParsedFields)
        elif documentType == InputDocumentType.ANSWER:
            parsedFields = AnswerParsedFields(**rawParsedFields)
        elif documentType == InputDocumentType.DECISION:
            parsedFields = DecisionParsedFields(**rawParsedFields)
        else:
            parsedFields = DecisionParsedFields()
    else:
        if documentType == InputDocumentType.NOTICE:
            parsedFields = NoticeParsedFields()
        elif documentType == InputDocumentType.ANSWER:
            parsedFields = AnswerParsedFields()
        else:
            parsedFields = DecisionParsedFields()

    return DocumentExtractResult(
        sourceDocumentType=documentType,
        isValidForStage=isValid,
        invalidReason=data.get("invalidReason") or None,
        rawText=rawText,
        summary=data.get("summary") or None,
        parsedFields=parsedFields,
    )