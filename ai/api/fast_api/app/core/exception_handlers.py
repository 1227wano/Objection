from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError

from app.core.exceptions import AppException
from app.core.responses import createErrorResponse


async def appExceptionHandler(
    request: Request,
    exc: AppException,
):
    return createErrorResponse(
        statusCode=exc.statusCode,
        message=exc.message,
    )


async def requestValidationExceptionHandler(
    request: Request,
    exc: RequestValidationError,
):
    return createErrorResponse(
        statusCode=422,
        message="invalid request",
    )


async def unhandledExceptionHandler(
    request: Request,
    exc: Exception,
):
    return createErrorResponse(
        statusCode=500,
        message="internal server error",
    )


def registerExceptionHandlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, appExceptionHandler)
    app.add_exception_handler(
        RequestValidationError,
        requestValidationExceptionHandler,
    )
    app.add_exception_handler(Exception, unhandledExceptionHandler)
