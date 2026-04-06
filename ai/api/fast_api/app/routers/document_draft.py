from fastapi import APIRouter

from app.orchestrators.document_draft_orchestrator import (
    createDocumentDraftOrchestration,
)
from app.schemas.document_draft import DocumentDraftRequest, DocumentDraftResponse

router = APIRouter(
    prefix="/ai/agents/document-draft",
    tags=["documentDraft"],
)


@router.post("", response_model=DocumentDraftResponse)
def documentDraft(
    request: DocumentDraftRequest,
) -> DocumentDraftResponse:
    return createDocumentDraftOrchestration(request)
