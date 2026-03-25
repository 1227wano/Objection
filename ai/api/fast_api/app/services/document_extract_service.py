import os
import base64
import json
import io
import logging
import httpx
import pdfplumber
from urllib.parse import urlparse

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
# ?ㅼ젙
# -----------------------------------------------

GMS_CHAT_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
GMS_API_KEY_ENV = "GMS_KEY"
FILE_DOWNLOAD_TIMEOUT_SECONDS = 30.0

# Step 1: OCR ???대?吏?먯꽌 ?띿뒪?몃쭔 異붿텧 (Vision, gpt-4o-mini)
OCR_MODEL = "gpt-4o"
# Step 2: ?꾨뱶 留ㅽ븨 ???띿뒪?몄뿉??援ъ“?붾맂 JSON 異붿텧 (Text, gpt-4.1-mini)
MAPPING_MODEL = "gpt-4.1-mini"

MAX_IMAGE_SIZE = (1000, 1000)
JPEG_QUALITY = 70

# -----------------------------------------------
# Step 1 ?꾨＼?꾪듃 ??OCR ?꾩슜
# -----------------------------------------------

OCR_SYSTEM_PROMPT = """\
?뱀떊? ?쒓뎅??臾몄꽌 OCR ?꾨Ц媛?낅땲??
二쇱뼱吏?臾몄꽌 ?대?吏???띿뒪?몃? 鍮좎쭚?놁씠 ?뺥솗?섍쾶 異붿텧?섏꽭??

洹쒖튃:
1. ???뚯씠釉? 援ъ“??媛????[??ぉ紐?: [?댁슜] ?뺤떇?쇰줈 蹂?섑븯?몄슂.
2. 以꾨컮轅덇낵 臾몃떒 援щ텇???좎??섏꽭??
3. 留덉뒪??媛由?泥섎━??遺遺꾩? [留덉뒪?? ?쇰줈 ?쒓린?섏꽭??
4. ?꾩옣/吏곸씤? 臾댁떆?섏꽭??
5. 異붿텧???띿뒪?몃쭔 異쒕젰?섏꽭?? ?ㅻ챸?대굹 二쇱꽍??異붽??섏? 留덉꽭??"""

OCR_USER_PROMPT = "??臾몄꽌??紐⑤뱺 ?띿뒪?몃? ?뺥솗?섍쾶 異붿텧?섏꽭??"

# -----------------------------------------------
# Step 2 ?꾨＼?꾪듃 ???꾨뱶 留ㅽ븨 ?꾩슜
# -----------------------------------------------

MAPPING_SYSTEM_PROMPT = """\
?뱀떊? ?쒓뎅 ?됱젙泥섎텇 臾몄꽌 遺꾩꽍 ?꾨Ц媛?낅땲??
二쇱뼱吏?臾몄꽌 ?띿뒪?몃? 遺꾩꽍?섏뿬 諛섎뱶??JSON ?뺤떇?쇰줈留??묐떟?섏꽭??
JSON ???ㅻⅨ ?띿뒪?? ?ㅻ챸, 留덊겕?ㅼ슫 肄붾뱶釉붾줉? ?덈? ?ы븿?섏? 留덉꽭??"""


# -----------------------------------------------
# 硫붿씤 濡쒖쭅
# -----------------------------------------------

def extractDocument(request: DocumentExtractRequest) -> DocumentExtractResponse:
    documentType = request.sourceDocumentType
    apiKey = _getApiKey()
    fileBytes, mimeType = _loadFile(request.fileUrl)

    if mimeType == "application/pdf":
        # PDF ???띿뒪??吏곸젒 異붿텧 (OCR ?ㅽ궢)
        rawText = _extractTextFromPdf(fileBytes)
    else:
        # ?대?吏 ??OCR : ?대?吏 ??rawText (gpt-4o)
        rawText = _step1Ocr(fileBytes, mimeType, apiKey)
        logger.info("Step 1 OCR completed: %d chars extracted", len(rawText))

    # Step 2: ?꾨뱶 留ㅽ븨 ??rawText ??援ъ“?붾맂 寃곌낵 (gpt-4.1-mini)
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
    """PDF?먯꽌 ?띿뒪?몃? 吏곸젒 異붿텧?쒕떎."""
    with pdfplumber.open(io.BytesIO(fileBytes)) as pdf:
        pages = []
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    if not pages:
        raise ServiceException("PDF?먯꽌 ?띿뒪?몃? 異붿텧?????놁뒿?덈떎")
    return "\n\n".join(pages)

def _step1Ocr(fileBytes: bytes, mimeType: str, apiKey: str) -> str:
    """?대?吏?먯꽌 rawText留?異붿텧?쒕떎."""
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
# Step 2: ?꾨뱶 留ㅽ븨 (gpt-4.1-mini, chat/completions, role=system)
# -----------------------------------------------

def _step2Mapping(
        rawText: str,
        documentType: InputDocumentType,
        apiKey: str,
) -> DocumentExtractResult:
    """rawText?먯꽌 援ъ“?붾맂 ?꾨뱶瑜?異붿텧?쒕떎."""
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
    """臾몄꽌 醫낅쪟蹂?留ㅽ븨 ?꾨＼?꾪듃瑜??앹꽦?쒕떎."""

    if documentType == InputDocumentType.NOTICE:
        fieldsSpec = """\
    "disposalDate": "YYYY-MM-DD ?뺤떇. 泥섎텇?쇱옄/?됱젙泥섎텇??泥섎텇 ?쒖옉?? ?놁쑝硫?null",
    "agencyName": "泥섎텇 湲곌?紐?(?? ?쒖슱?밸퀎??媛뺣궓援ъ껌). 臾몄꽌 ?섎떒 諛쒖떊??李멸퀬. ?놁쑝硫?null",
    "sanctionType": "?곸뾽?뺤? / 怨쇱쭠湲?/ ?곸뾽?덇?痍⑥냼 / ?곸뾽?먯뇙紐낅졊 以??뺥솗???섎굹. ?놁쑝硫?null",
    "sanctionValue": "?곸뾽?뺤?쨌?먯뇙紐낅졊?대㈃ ?쇱닔(?レ옄), 怨쇱쭠湲덉씠硫?湲덉븸(?? ?レ옄), ?덇?痍⑥냼硫?null",
    "businessName": "?낆냼紐??곹샇. ?놁쑝硫?null",
    "businessAddress": "?낆냼 ?뚯옱吏 二쇱냼. ?놁쑝硫?null",
    "title": "???ш굔????以꾨줈 ?붿빟???쒕ぉ (AI ?앹꽦)",
    "Inform": "遺덈났?덉감 ?덈궡/怨좎? ?댁슜???덉쑝硫?true, ?놁쑝硫?false",
    "InformContent": "遺덈났?덉감 怨좎? ?댁슜 ?꾨Ц. ?놁쑝硫?null",
    "legalBasis": ["洹쇨굅 踰뺤“??諛곗뿴. ?? '?앺뭹?꾩깮踰???4議?, '?뚯븙?곗뾽吏꾪씎?먭??쒕쾿瑜???2議?"],
    "etc": {"臾몄꽌?먯꽌 異붿텧??湲고? 二쇱슂 ?뺣낫": "臾몄옄??媛믩쭔 媛?? 由ъ뒪??諛곗뿴/媛앹껜 ?덈? 湲덉?. ?щ윭 ??ぉ? ?쇳몴濡?援щ텇???섎굹??臾몄옄?대줈 ?묒꽦"}"""

    elif documentType == InputDocumentType.ANSWER:
        fieldsSpec = """\
    "caseNum": "?ш굔踰덊샇 (?? 2026-01234). ?놁쑝硫?null",
    "caseName": "?ш굔紐? ?놁쑝硫?null",
    "legalBasis": ["洹쇨굅 踰뺤“??諛곗뿴"],
    "etc": {"湲고? 二쇱슂 ?뺣낫": "媛?}"""

    elif documentType == InputDocumentType.DECISION:
        fieldsSpec = """\
    "etc": {"二쇰Ц ?댁슜, 泥?뎄 痍⑥?, 洹쇨굅 踰뺤“ ??二쇱슂 ?뺣낫": "媛?}"""

    else:
        fieldsSpec = '"etc": {}'

    return f"""\
?ㅼ쓬? ?쒓뎅 ?됱젙泥섎텇 愿??臾몄꽌({documentType.value})??OCR 異붿텧 ?띿뒪?몄엯?덈떎.

<document>
{rawText}
</document>

???띿뒪?몃? 遺꾩꽍?섏뿬 ?꾨옒 JSON ?뺤떇?쇰줈 ?뺣낫瑜?異붿텧?섏꽭??

?먮떒 湲곗?:
- "?ъ쟾?듭???, "?섍껄?쒖텧", "泥섎텇?섍퀬???섎뒗 ?댁슜" ?깆쓽 ?쒗쁽???덉쑝硫??ъ쟾?듭??쒖엯?덈떎 ??isValidForStage: false
- "泥섎텇?듭???, "泥섎텇紐낅졊??, "?됱젙泥섎텇紐낅졊?? ?깆? ?뺤떇 泥섎텇 臾몄꽌?낅땲????isValidForStage: true

?묐떟 JSON:
{{
  "isValidForStage": true/false,
  "invalidReason": null ?먮뒗 "?ъ쟾?듭??쒕줈 ?먮떒?? ???ъ쑀,
  "summary": "臾몄꽌瑜?1~2以꾨줈 ?붿빟",
  "parsedFields": {{
{fieldsSpec}
  }}
}}"""


# -----------------------------------------------
# GMS API 怨듯넻 ?몄텧 (chat/completions)
# -----------------------------------------------

def _callGms(payload: dict, apiKey: str, stepName: str) -> dict:
    """GMS Chat Completions API瑜??몄텧?섍퀬 ?묐떟 body瑜?諛섑솚?쒕떎."""
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
    """chat/completions ?묐떟?먯꽌 ?띿뒪?몃? 異붿텧?쒕떎. (choices[0].message.content)"""
    try:
        return responseBody["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise ServiceException(
            f"[{stepName}] failed to extract text from response: {responseBody}"
        ) from exc


# -----------------------------------------------
# ?뚯씪 濡쒕뵫
# -----------------------------------------------

def _loadFile(fileUrl: str) -> tuple[bytes, str]:
    try:
        with httpx.Client(
            timeout=httpx.Timeout(FILE_DOWNLOAD_TIMEOUT_SECONDS, connect=10.0),
            follow_redirects=True,
        ) as client:
            response = client.get(fileUrl)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise ServiceException(f"failed to download file: {exc.response.status_code}") from exc
    except httpx.RequestError as exc:
        raise ServiceException("failed to download file") from exc

    fileBytes = response.content
    contentType = response.headers.get("Content-Type")
    mimeType = _detectMimeType(fileUrl, contentType)

    if mimeType == "application/pdf":
        return fileBytes, "application/pdf"

    if mimeType in (".jpg", ".jpeg", ".png", "image/jpeg", "image/png"):
        try:
            from PIL import Image
        except ImportError:
            raise ServiceException("Pillow is not installed. Run: pip install Pillow")

        img = Image.open(io.BytesIO(fileBytes))
        if img.mode in ("RGBA", "P", "LA", "L"):
            img = img.convert("RGB")

        img.thumbnail(MAX_IMAGE_SIZE, Image.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return buffer.getvalue(), "image/jpeg"

    raise ServiceException(f"unsupported file type: {mimeType}")


def _detectMimeType(fileUrl: str, contentType: str | None) -> str:
    if contentType:
        normalized = contentType.split(";", 1)[0].strip().lower()
        if normalized in ("application/pdf", "image/jpeg", "image/png"):
            return normalized

    path = urlparse(fileUrl).path.lower()
    if path.endswith(".pdf"):
        return "application/pdf"
    if path.endswith(".jpg"):
        return ".jpg"
    if path.endswith(".jpeg"):
        return ".jpeg"
    if path.endswith(".png"):
        return ".png"

    raise ServiceException("unsupported file type")


# -----------------------------------------------
# API Key
# -----------------------------------------------

def _getApiKey() -> str:
    apiKey = os.getenv(GMS_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("GMS API key is not configured")
    return apiKey


# -----------------------------------------------
# Step 2 ?묐떟 ?뚯떛
# -----------------------------------------------

def _parseMappingResult(
        jsonText: str,
        rawText: str,
        documentType: InputDocumentType,
) -> DocumentExtractResult:
    """Step 2 留ㅽ븨 寃곌낵 JSON???뚯떛?섏뿬 DocumentExtractResult濡?蹂?섑븳??"""

    # JSON ?뚯떛 (肄붾뱶釉붾줉 媛먯떥湲????
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

    # rawParsedFields 媛?몄삩 吏곹썑??
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
