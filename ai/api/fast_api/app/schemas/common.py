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


class CaseResponse(BaseSchema, Generic[ResultType]):
    caseNo: int
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
# ParsedFields — 문서 종류별 분리
# -----------------------------------------------

class NoticeParsedFields(BaseModel):
    """처분서(NOTICE) 파싱 결과"""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    disposalDate: str | None = None
    agencyName: str | None = None
    sanctionType: str | None = None          # 영업정지 / 과징금 / 영업허가취소 / 영업폐쇄명령
    sanctionValue: str | None = None  # 영업정지/영업폐쇄명령 → 일수, 과징금 → 금액(원), 영업허가취소 → null
    businessName: str | None = None
    businessAddress: str | None = None
    title: str | None = None                 # AI 생성 사건 제목
    Inform: bool | None = None               # 처분청의 불복절차고지 유무
    InformContent: str | None = None         # 불복절차고지 내용
    legalBasis: list[str] = Field(default_factory=list)
    etc: dict[str, str] = Field(default_factory=dict)

    @field_validator("sanctionValue", mode="before")
    @classmethod
    def normalizeSanctionValue(cls, value: object) -> str | None:
        if value is None:
            return None
        return str(value).strip()


class AnswerParsedFields(BaseModel):
    """답변서(ANSWER) 파싱 결과"""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    caseNum: str | None = None
    caseName: str | None = None
    legalBasis: list[str] = Field(default_factory=list)
    etc: dict[str, str] = Field(default_factory=dict)


class DecisionParsedFields(BaseModel):
    """재결서(DECISION) 파싱 결과"""
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    etc: dict[str, str] = Field(default_factory=dict)


# -----------------------------------------------
# DocumentExtractResult — 최상위 응답 result
# -----------------------------------------------

class DocumentExtractResult(BaseSchema):
    sourceDocumentType: InputDocumentType
    isValidForStage: bool
    invalidReason: str | None = None
    rawText: str | None = None
    summary: str | None = None
    parsedFields: NoticeParsedFields | AnswerParsedFields | DecisionParsedFields = Field(
        default_factory=DecisionParsedFields
    )


# -----------------------------------------------
# 하위 Agent 호환 스키마 (A-1, A-2에서 사용)
# -----------------------------------------------

class ParsedFields(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    disposalDate: str | None = None
    agencyName: str | None = None
    claimant: str | None = None
    businessName: str | None = None
    businessAddress: str | None = None


class DocumentExtractResultSummary(BaseSchema):
    documentType: InputDocumentType
    caseTitle: str
    summary: str
    searchHints: list[str]
    parsedFields: ParsedFields


class LegalIssueDocumentExtractResult(BaseSchema):
    documentType: InputDocumentType
    caseTitle: str
    title: str
    rawText: str
    summary: str
    parsedFields: ParsedFields


class CaseContext(BaseSchema):
    fact: str
    opinion: str


class AppealClaimContent(BaseSchema):
    committeeType: str | None = None
    dispositionContent: str | None = None
    claimPurpose: str | None = None
    claimReason: str | None = None
    inform: bool | None = None
    informContent: str | None = None
    awareDate: str | None = None
    agencyName: str | None = None
    preparedEvidenceList: list[str] | None = None


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
    sourceDocumentType: InputDocumentType
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
    sanctionValue: str | None = None # 영업정지/영업폐쇄명령 → 일수, 과징금 → 금액(원), 영업허가취소 → nul
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
    verification: str
    needsRewrite: bool
    errors: list[ReviewError]
    draftDocument: DraftDocument
