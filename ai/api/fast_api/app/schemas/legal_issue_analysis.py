from pydantic import Field, model_validator

from app.schemas.common import (
    BaseSchema,
    CaseContext,
    CaseGovResponse,
    LegalIssueDocumentExtractResult,
    LawRetrieval,
    LegalIssueAnalysisResult,
)
from app.schemas.enums import InputDocumentType, Stage

STAGE_DOCUMENT_TYPE_MAP = {
    Stage.APPEAL: InputDocumentType.NOTICE,
    Stage.ANSWER_RESPONSE: InputDocumentType.ANSWER,
    Stage.DECISION_REVIEW: InputDocumentType.DECISION,
}


class LegalIssueAnalysisRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    stage: Stage
    documentExtractResult: LegalIssueDocumentExtractResult
    caseContext: CaseContext
    lawRetrievals: list[LawRetrieval]

    @model_validator(mode="after")
    def validateStageDocumentType(self) -> "LegalIssueAnalysisRequest":
        expectedDocumentType = STAGE_DOCUMENT_TYPE_MAP[self.stage]
        if self.documentExtractResult.documentType != expectedDocumentType:
            raise ValueError("documentType is not valid for stage")
        if not self.lawRetrievals:
            raise ValueError("lawRetrievals must not be empty")
        return self


class LegalIssueAnalysisResponse(CaseGovResponse[LegalIssueAnalysisResult]):
    pass
