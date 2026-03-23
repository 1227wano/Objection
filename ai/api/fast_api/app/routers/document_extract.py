from fastapi import APIRouter

from app.schemas.document_extract import (
    DocumentExtractRequest,
    DocumentExtractResponse,
)
from app.services.document_extract_service import extractDocument

router = APIRouter(
    prefix="/ai/agents/document-extract",
    tags=["documentExtract"],
)


@router.post("", response_model=DocumentExtractResponse)
def documentExtract(
    request: DocumentExtractRequest,
) -> DocumentExtractResponse:
    return extractDocument(request)
