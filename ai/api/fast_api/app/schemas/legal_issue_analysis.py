from pydantic import Field, model_validator

from app.schemas.common import (
    AnswerParsedFields,
    AppealClaimContent,
    BaseSchema,
    CaseContext,
    CaseGovResponse,
    DecisionParsedFields,
    LawRetrieval,
    LegalIssueAnalysisResult,
    NoticeParsedFields,
)
from app.schemas.enums import InputDocumentType


class A1CaseInfo(BaseSchema):
    disposalDate: str | None = None
    agencyName: str | None = None
    sanctionType: str | None = None
    sanctionValue: str | None = None
    parsedFields: NoticeParsedFields | AnswerParsedFields | DecisionParsedFields
    rawText: str | None = None


class LegalIssueAnalysisRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    sourceDocumentType: InputDocumentType
    caseInfo: A1CaseInfo
    caseContext: CaseContext
    lawRetrievals: list[LawRetrieval] = Field(min_length=1)
    appealClaimContent: AppealClaimContent | None = None

    @model_validator(mode="after")
    def validateAppealClaimContent(self) -> "LegalIssueAnalysisRequest":
        if (
            self.sourceDocumentType == InputDocumentType.ANSWER
            and self.appealClaimContent is None
        ):
            raise ValueError(
                "appealClaimContent is required when sourceDocumentType is ANSWER"
            )
        return self


class LegalIssueAnalysisResponse(CaseGovResponse[LegalIssueAnalysisResult]):
    pass
