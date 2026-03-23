from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.schemas.enums import Status


def createErrorResponse(
    statusCode: int,
    message: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=statusCode,
        content=jsonable_encoder(
            {
                "status": Status.FAIL,
                "message": message,
                "result": None,
                "warnings": [],
            }
        ),
    )
