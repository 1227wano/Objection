from fastapi import APIRouter

from app.schemas.common import ApiResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse[dict[str, str]])
def healthCheck() -> ApiResponse[dict[str, str]]:
    return ApiResponse(
        status="SUCCESS",
        message="ok",
        result={},
        warnings=[],
    )
