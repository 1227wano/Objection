from app.routers.document_draft import router as documentDraftRouter
from app.routers.document_extract import router as documentExtractRouter
from app.routers.document_review import router as documentReviewRouter
from app.routers.health import router as healthRouter
from app.routers.legal_issue_analysis import router as legalIssueAnalysisRouter
from app.routers.strategy_precedent_analysis import (
    router as strategyPrecedentAnalysisRouter,
)
from app.routers.text_embedding import router as textEmbeddingRouter

__all__ = [
    "documentDraftRouter",
    "documentExtractRouter",
    "documentReviewRouter",
    "healthRouter",
    "legalIssueAnalysisRouter",
    "strategyPrecedentAnalysisRouter",
    "textEmbeddingRouter",
]
