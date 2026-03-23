from pydantic import Field, model_validator

from app.schemas.common import (
    BaseSchema,
    CaseContext,
    CaseGovResponse,
    DocumentExtractResultSummary,
    LegalIssueAnalysisResult,
    PrecedentRetrieval,
    StrategyPrecedentAnalysisResult,
)
from app.schemas.enums import InputDocumentType, Stage

STAGE_DOCUMENT_TYPE_MAP = {
    Stage.APPEAL: InputDocumentType.NOTICE,
    Stage.ANSWER_RESPONSE: InputDocumentType.ANSWER,
    Stage.DECISION_REVIEW: InputDocumentType.DECISION,
}


class StrategyPrecedentAnalysisRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    stage: Stage
    documentExtractResult: DocumentExtractResultSummary
    caseContext: CaseContext
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    precedentRetrievals: list[PrecedentRetrieval]

    @model_validator(mode="after")
    def validateStageDocumentType(self) -> "StrategyPrecedentAnalysisRequest":
        expectedDocumentType = STAGE_DOCUMENT_TYPE_MAP[self.stage]
        if self.documentExtractResult.documentType != expectedDocumentType:
            raise ValueError("documentType is not valid for stage")
        if not self.precedentRetrievals:
            raise ValueError("precedentRetrievals must not be empty")
        return self


class StrategyPrecedentAnalysisResponse(
    CaseGovResponse[StrategyPrecedentAnalysisResult]
):
    pass
