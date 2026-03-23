from pydantic import Field, field_validator

from app.schemas.common import (
    ApiResponse,
    BaseSchema,
    CaseContext,
    CaseInfo,
    DocumentDraftResult,
    DocumentExtractResultSummary,
    LegalIssueAnalysisResult,
    StrategyPrecedentAnalysisResult,
)
from app.schemas.enums import OutputDocumentType


class DocumentDraftRequest(BaseSchema):
    analysisNo: int = Field(gt=0)
    documentType: OutputDocumentType
    caseInfo: CaseInfo
    documentExtractResult: DocumentExtractResultSummary
    caseContext: CaseContext
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    strategyPrecedentAnalysisResult: StrategyPrecedentAnalysisResult
    preparedEvidenceList: list[str]

    @field_validator("preparedEvidenceList")
    @classmethod
    def validatePreparedEvidenceList(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("preparedEvidenceList must not be empty")
        return value


class DocumentDraftResponse(ApiResponse[DocumentDraftResult]):
    pass
