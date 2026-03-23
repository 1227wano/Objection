from pydantic import Field

from app.schemas.common import (
    ApiResponse,
    BaseSchema,
    CaseInfo,
    DocumentReviewResult,
    DraftDocument,
    LegalIssueAnalysisResult,
    StrategyPrecedentAnalysisResult,
)
from app.schemas.enums import OutputDocumentType


class DocumentReviewRequest(BaseSchema):
    analysisNo: int = Field(gt=0)
    documentType: OutputDocumentType
    draftDocument: DraftDocument
    caseInfo: CaseInfo
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    strategyPrecedentAnalysisResult: StrategyPrecedentAnalysisResult


class DocumentReviewResponse(ApiResponse[DocumentReviewResult]):
    pass
