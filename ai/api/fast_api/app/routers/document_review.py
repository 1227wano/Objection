from fastapi import APIRouter

from app.schemas.document_review import (
    DocumentReviewRequest,
    DocumentReviewResponse,
)
from app.services.document_review_service import reviewDocument

router = APIRouter(
    prefix="/ai/agents/document-review",
    tags=["documentReview"],
)


@router.post("", response_model=DocumentReviewResponse)
def documentReview(
    request: DocumentReviewRequest,
) -> DocumentReviewResponse:
    return reviewDocument(request)
