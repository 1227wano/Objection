from app.schemas.common import (
    ApiResponse,
    AnswerParsedFields,
    BaseSchema,
    CaseContext,
    CaseGovResponse,
    CaseInfo,
    DecisionParsedFields,
    DocumentExtractResult,
    LawRetrieval,
    LegalIssue,
    LegalIssueAnalysisResult,
    MainPoint,
    NoticeParsedFields,
    PrecedentInfo,
    PrecedentRetrieval,
    ReviewError,
    StrategyPrecedentAnalysisResult,
)
from app.schemas.document_draft import DocumentDraftRequest, DocumentDraftResponse
from app.schemas.document_extract import DocumentExtractRequest, DocumentExtractResponse
from app.schemas.document_review import (
    DocumentReviewRequest,
    DocumentReviewResult,
    DraftDocument,
)
from app.schemas.enums import InputDocumentType, OutputDocumentType, Status
from app.schemas.legal_issue_analysis import (
    LegalIssueAnalysisRequest,
    LegalIssueAnalysisResponse,
)
from app.schemas.strategy_precedent_analysis import (
    StrategyPrecedentAnalysisRequest,
    StrategyPrecedentAnalysisResponse,
)
from app.schemas.text_embedding import (
    TextEmbeddingRequest,
    TextEmbeddingResponse,
    TextEmbeddingResult,
)

__all__ = [
    "ApiResponse",
    "AnswerParsedFields",
    "BaseSchema",
    "CaseContext",
    "CaseGovResponse",
    "CaseInfo",
    "DecisionParsedFields",
    "DocumentDraftRequest",
    "DocumentDraftResponse",
    "DocumentExtractRequest",
    "DocumentExtractResponse",
    "DocumentExtractResult",
    "DocumentReviewRequest",
    "DocumentReviewResult",
    "DraftDocument",
    "InputDocumentType",
    "LawRetrieval",
    "LegalIssue",
    "LegalIssueAnalysisRequest",
    "LegalIssueAnalysisResponse",
    "LegalIssueAnalysisResult",
    "MainPoint",
    "NoticeParsedFields",
    "OutputDocumentType",
    "PrecedentInfo",
    "PrecedentRetrieval",
    "ReviewError",
    "Status",
    "StrategyPrecedentAnalysisRequest",
    "StrategyPrecedentAnalysisResponse",
    "StrategyPrecedentAnalysisResult",
    "TextEmbeddingRequest",
    "TextEmbeddingResponse",
    "TextEmbeddingResult",
]
