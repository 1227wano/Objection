import os

from app.core.exceptions import ServiceException
from app.schemas.enums import Status
from app.schemas.text_embedding import (
    TextEmbeddingRequest,
    TextEmbeddingResponse,
    TextEmbeddingResult,
)

EMBEDDING_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/embeddings"
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_API_KEY_ENV = "GMS_KEY"
EMBEDDING_TIMEOUT_SECONDS = 30.0


def createTextEmbedding(request: TextEmbeddingRequest) -> TextEmbeddingResponse:
    try:
        import httpx
    except ModuleNotFoundError as exc:
        raise ServiceException("httpx is not installed") from exc

    apiKey = os.getenv(EMBEDDING_API_KEY_ENV)
    if not apiKey:
        raise ServiceException("embedding api key is not configured")

    try:
        with httpx.Client(timeout=EMBEDDING_TIMEOUT_SECONDS) as client:
            response = client.post(
                EMBEDDING_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {apiKey}",
                },
                json={
                    "model": EMBEDDING_MODEL,
                    "input": request.text,
                },
            )
            response.raise_for_status()
            responseBody = response.json()
    except httpx.HTTPStatusError as exc:
        raise ServiceException("embedding generation failed") from exc
    except httpx.RequestError as exc:
        raise ServiceException("embedding api request failed") from exc
    except ValueError as exc:
        raise ServiceException("embedding api response is invalid") from exc

    embedding = _extractEmbedding(responseBody)

    return TextEmbeddingResponse(
        status=Status.SUCCESS,
        message="embedding created",
        result=TextEmbeddingResult(
            embedding=embedding,
        ),
        warnings=[],
    )


def _extractEmbedding(responseBody: dict) -> list[float]:
    data = responseBody.get("data")
    if not isinstance(data, list) or not data:
        raise ServiceException("embedding api response is invalid")

    firstItem = data[0]
    if not isinstance(firstItem, dict):
        raise ServiceException("embedding api response is invalid")

    embedding = firstItem.get("embedding")
    if not isinstance(embedding, list) or not embedding:
        raise ServiceException("embedding api response is invalid")

    if not all(isinstance(value, (int, float)) for value in embedding):
        raise ServiceException("embedding api response is invalid")

    return [float(value) for value in embedding]
