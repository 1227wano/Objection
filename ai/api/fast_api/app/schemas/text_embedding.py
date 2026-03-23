from pydantic import field_validator

from app.schemas.common import ApiResponse, BaseSchema


class TextEmbeddingRequest(BaseSchema):
    text: str


class TextEmbeddingResult(BaseSchema):
    embedding: list[float]

    @field_validator("embedding")
    @classmethod
    def validateEmbedding(cls, value: list[float]) -> list[float]:
        if not value:
            raise ValueError("embedding must not be empty")
        return value


class TextEmbeddingResponse(ApiResponse[TextEmbeddingResult]):
    pass
