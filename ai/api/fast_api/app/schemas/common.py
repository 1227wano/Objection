from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.enums import InputDocumentType, OutputDocumentType, Stage, Status

ResultType = TypeVar("ResultType")


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
    )

    @field_validator("*", mode="before")
    @classmethod
    def validateStringField(cls, value: object) -> object:
        if isinstance(value, str):
            strippedValue = value.strip()
            if not strippedValue:
                raise ValueError("must not be blank")
            return strippedValue
        return value


class ApiResponse(BaseSchema, Generic[ResultType]):
    status: Status
    message: str
    result: ResultType
    warnings: list[str] = Field(default_factory=list)


class CaseGovResponse(BaseSchema, Generic[ResultType]):
    caseNo: int
    govDocNo: int
    status: Status
    message: str
    result: ResultType
    warnings: list[str] = Field(default_factory=list)


# -----------------------------------------------
# typeSpecific 스키마 (문서 종류별)
# -----------------------------------------------

class NoticeTypeSpecific(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    sanctionType: str | None = None
    sanctionDays: int | None = Field(default=None, gt=0)
    legalBasis: list[str] = Field(default_factory=list)
    dispositionContent: str | None = None


class AnswerTypeSpecific(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    respondent: str | None = None
    answerSummary: str | None = None
    defensePoints: list[str] = Field(default_factory=list)


class DecisionTypeSpecific(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    caseNumber: str | None = None
    decisionResult: str | None = None
    orderText: str | None = None
    reasonSummary: str | None = None


# -----------------------------------------------
# ParsedFields — 명세서 기준
# -----------------------------------------------

class ParsedFields(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    disposalDate: str | None = None
    agencyName: str | None = None
    claimant: str | None = None
    businessName: str | None = None
    businessAddress: str | None = None
    typeSpecific: NoticeTypeSpecific | AnswerTypeSpecific | DecisionTypeSpecific | None = None


class DocumentExtractResultBase(BaseSchema):
    documentType: InputDocumentType
    parsedFields: ParsedFields


class DocumentExtractResultSummary(DocumentExtractResultBase):
    caseTitle: str
    summary: str
    searchHints: list[str]

    @field_validator("searchHints")
    @classmethod
    def validateSearchHints(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("must not be empty")
        return value


class DocumentExtractResultDetail(DocumentExtractResultSummary):
    title: str
    rawText: str


class LegalIssueDocumentExtractResult(BaseSchema):
    documentType: InputDocumentType
    caseTitle: str
    title: str
    rawText: str
    summary: str
    parsedFields: ParsedFields


class DocumentExtractResult(BaseSchema):
    documentType: InputDocumentType
    isValidForStage: bool
    invalidReason: str | None = None
    caseTitle: str | None = None
    title: str | None = None
    rawText: str | None = None
    summary: str | None = None
    parsedFields: ParsedFields = Field(default_factory=ParsedFields)
    searchHints: list[str] = Field(default_factory=list)


class CaseContext(BaseSchema):
    fact: str
    opinion: str


class LawRetrieval(BaseSchema):
    lawName: str
    articleNo: str
    provisionText: str


class LegalIssue(BaseSchema):
    issueType: str
    description: str
    lawBasis: str
    basisText: str
    riskLevel: str


class LegalIssueAnalysisResult(BaseSchema):
    legalIssueSummary: str
    legalWeaknessFound: bool
    legalIssues: list[LegalIssue]


class PrecedentRetrieval(BaseSchema):
    precedentNo: str
    precedentName: str
    summary: str
    similarityScore: float = Field(ge=0.0, le=1.0)


class MainPoint(BaseSchema):
    point: str
    reason: str
    sourceText: str


class PrecedentInfo(BaseSchema):
    precedentNo: str
    precedentName: str
    matchReason: str
    usagePoint: str


class StrategyPrecedentAnalysisResult(BaseSchema):
    claimType: str
    appealPossibility: str
    strategySummary: str
    mainPoints: list[MainPoint]
    stayRecommended: bool
    precedentInfos: list[PrecedentInfo]
    recommendedEvidence: list[str]


class CaseInfo(BaseSchema):
    agencyName: str
    businessName: str
    businessAddress: str
    sanctionType: str
    sanctionDays: int = Field(gt=0)
    claimType: str


class DraftDocumentContent(BaseSchema):
    claimPurpose: str
    claimReason: str
    factSummary: str
    legalArguments: list[str]
    evidenceList: list[str]

    @field_validator("legalArguments", "evidenceList")
    @classmethod
    def validateNonEmptyStringList(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("must not be empty")
        return value


class DraftDocument(BaseSchema):
    title: str
    contentJson: DraftDocumentContent


class DocumentDraftResult(BaseSchema):
    analysisNo: int
    documentType: OutputDocumentType
    title: str
    contentJson: DraftDocumentContent


class ReviewError(BaseSchema):
    field: str
    reason: str
    suggestion: str


class DocumentReviewResult(BaseSchema):
    analysisNo: int
    documentType: OutputDocumentType
    needsRewrite: bool
    errors: list[ReviewError]
    draftDocument: DraftDocument