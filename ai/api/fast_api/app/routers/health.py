from fastapi import APIRouter

from app.core.enums import Status
from app.schemas.common import ApiResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse[dict[str, str]])
def healthCheck() -> ApiResponse[dict[str, str]]:
    return ApiResponse(
        status=Status.SUCCESS,
        message="ok",
        result={},
        warnings=[],
    )
