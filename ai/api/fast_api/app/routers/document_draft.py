from fastapi import APIRouter

from app.schemas.document_draft import DocumentDraftRequest, DocumentDraftResponse
from app.services.document_draft_service import createDocumentDraft

router = APIRouter(
    prefix="/ai/agents/document-draft",
    tags=["documentDraft"],
)


@router.post("", response_model=DocumentDraftResponse)
def documentDraft(
    request: DocumentDraftRequest,
) -> DocumentDraftResponse:
    return createDocumentDraft(request)
