from fastapi import APIRouter

from app.schemas.text_embedding import TextEmbeddingRequest, TextEmbeddingResponse
from app.services.text_embedding_service import createTextEmbedding

router = APIRouter(
    prefix="/ai/agents/text-embedding",
    tags=["textEmbedding"],
)


@router.post("", response_model=TextEmbeddingResponse)
def textEmbedding(
    request: TextEmbeddingRequest,
) -> TextEmbeddingResponse:
    return createTextEmbedding(request)
