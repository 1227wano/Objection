from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv

from app.core.exception_handlers import registerExceptionHandlers
from app.routers.document_draft import router as documentDraftRouter
from app.routers.document_extract import router as documentExtractRouter
from app.routers.document_review import router as documentReviewRouter
from app.routers.health import router as healthRouter
from app.routers.legal_issue_analysis import router as legalIssueAnalysisRouter
from app.routers.strategy_precedent_analysis import (
    router as strategyPrecedentAnalysisRouter,
)
from app.routers.text_embedding import router as textEmbeddingRouter

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def createApp() -> FastAPI:
    app = FastAPI(
        title="Administrative Appeal AI API",
        version="0.1.0",
    )

    registerExceptionHandlers(app)
    app.include_router(healthRouter)
    app.include_router(documentExtractRouter)
    app.include_router(legalIssueAnalysisRouter)
    app.include_router(strategyPrecedentAnalysisRouter)
    app.include_router(documentDraftRouter)
    app.include_router(documentReviewRouter)
    app.include_router(textEmbeddingRouter)

    return app


app = createApp()
