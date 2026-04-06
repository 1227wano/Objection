from pydantic import Field

from app.schemas.common import BaseSchema, ReviewError
from app.schemas.document_draft import (
    AppealClaimContentJson,
    SupplementStatementContentJson,
)
from app.schemas.enums import OutputDocumentType
from app.schemas.strategy_precedent_analysis import (
    CaseInfo,
    LegalIssueAnalysisResult,
    StrategyPrecedentAnalysisResult,
)

# -------------------------------------------------
# B 전용 스키마: A-3 contentJson 형태에 맞춤
# -------------------------------------------------

class DraftDocument(BaseSchema):
    title: str | None = None
    contentJson: AppealClaimContentJson | SupplementStatementContentJson


class DocumentReviewRequest(BaseSchema):
    analysisNo: int = Field(gt=0)
    documentType: OutputDocumentType
    draftDocument: DraftDocument
    caseInfo: CaseInfo
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    strategyPrecedentAnalysisResult: StrategyPrecedentAnalysisResult
    preparedEvidenceList: list[str] = Field(default_factory=list)


class DocumentReviewResult(BaseSchema):
    analysisNo: int
    documentType: OutputDocumentType
    verification: str
    needsRewrite: bool
    errors: list[ReviewError]
    draftDocument: DraftDocument


