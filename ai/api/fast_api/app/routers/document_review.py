from fastapi import APIRouter

from app.schemas.document_draft import DocumentDraftResponse
from app.schemas.document_review import DocumentReviewRequest
from app.services.document_review_service import reviewDocument

router = APIRouter(
    prefix="/ai/agents/document-review",
    tags=["documentReview"],
)


@router.post("", response_model=DocumentDraftResponse)
def documentReview(
    request: DocumentReviewRequest,
) -> DocumentDraftResponse:
    return reviewDocument(request)
