from typing import Any

from pydantic import Field, field_validator, model_validator

from app.schemas.common import AppealClaimContent, BaseSchema, CaseGovResponse
from app.schemas.enums import (
    AppealPossibility,
    ClaimType,
    InputDocumentType,
    LegalIssueType,
    RiskLevel,
)


class CaseInfo(BaseSchema):
    disposalDate: str | None = None
    agencyName: str | None = None
    sanctionType: str | None = None
    sanctionValue: str | None = None
    parsedFields: dict[str, Any] | None = None
    rawText: str | None = None


class CaseContext(BaseSchema):
    fact: str | None = None
    opinion: str | None = None


class LegalIssue(BaseSchema):
    issueType: LegalIssueType
    description: str | None = None
    lawBasis: str | None = None
    basisText: str | None = None
    riskLevel: RiskLevel


class LegalIssueAnalysisResult(BaseSchema):
    legalIssueSummary: str | None = None
    legalWeaknessFound: bool | None = None
    legalIssues: list[LegalIssue] | None = None


class PrecedentRetrieval(BaseSchema):
    precedentNo: str
    precedentName: str
    summary: str | None = None
    similarityScore: float | None = Field(default=None, ge=0.0, le=1.0)


class MainPoint(BaseSchema):
    point: str
    reason: str | None = None
    sourceText: str | None = None


class PrecedentInfo(BaseSchema):
    precedentNo: str
    precedentName: str
    summary: str | None = None
    matchReason: str | None = None
    usagePoint: str | None = None


class StrategyPrecedentAnalysisResult(BaseSchema):
    claimType: ClaimType
    appealPossibility: AppealPossibility
    strategySummary: str | None = None
    mainPoints: list[MainPoint] | None = None
    stayRecommended: bool | None = None
    precedentInfos: list[PrecedentInfo] | None = None
    recommendedEvidence: list[str] | None = None

    @field_validator("mainPoints")
    @classmethod
    def validateMainPoints(
        cls,
        value: list[MainPoint] | None,
    ) -> list[MainPoint] | None:
        if value is not None and len(value) > 3:
            raise ValueError("mainPoints must contain at most 3 items")
        return value


class StrategyPrecedentAnalysisRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    sourceDocumentType: InputDocumentType
    caseInfo: CaseInfo
    caseContext: CaseContext
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    precedentRetrievals: list[PrecedentRetrieval] | None = None
    appealClaimContent: AppealClaimContent | None = None

    @model_validator(mode="after")
    def validateAppealClaimContent(self) -> "StrategyPrecedentAnalysisRequest":
        if (
            self.sourceDocumentType == InputDocumentType.ANSWER
            and self.appealClaimContent is None
        ):
            raise ValueError(
                "appealClaimContent is required when sourceDocumentType is ANSWER"
            )
        return self


class StrategyPrecedentAnalysisResponse(
    CaseGovResponse[StrategyPrecedentAnalysisResult]
):
    pass
