from pydantic import Field

from app.schemas.common import (
    AnswerParsedFields,
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
    sanctionValue: int | None = Field(default=None, gt=0)
    parsedFields: NoticeParsedFields | AnswerParsedFields | DecisionParsedFields
    rawText: str | None = None


class LegalIssueAnalysisRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    sourceDocumentType: InputDocumentType
    caseInfo: A1CaseInfo
    caseContext: CaseContext
    lawRetrievals: list[LawRetrieval] = Field(min_length=1)


class LegalIssueAnalysisResponse(CaseGovResponse[LegalIssueAnalysisResult]):
    pass