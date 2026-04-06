from typing import Any

from pydantic import Field

from app.schemas.common import ApiResponse, BaseSchema
from app.schemas.enums import (
    AppealPossibility,
    ClaimType,
    LegalIssueType,
    OutputDocumentType,
    RiskLevel,
)


class CaseInfo(BaseSchema):
    disposalDate: str | None = None
    agencyName: str | None = None
    sanctionType: str | None = None
    sanctionValue: str | None = None
    parsedFields: dict[str, Any] | None = None
    rawText: str | None = None


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


class MainPoint(BaseSchema):
    point: str | None = None
    reason: str | None = None
    sourceText: str | None = None


class PrecedentInfo(BaseSchema):
    precedentNo: str | None = None
    precedentName: str | None = None
    summary: str | None = None
    matchReason: str | None = None
    usagePoint: str | None = None


class StrategyPrecedentAnalysisResult(BaseSchema):
    claimType: ClaimType
    appealPossibility: AppealPossibility
    strategySummary: str | None = None
    mainPoints: list[MainPoint] | None = None
    precedentInfos: list[PrecedentInfo] | None = None


class AppealClaimContentJson(BaseSchema):
    committeeType: str | None = None
    dispositionContent: str
    claimPurpose: str
    claimReason: str


class SupplementStatementContentJson(BaseSchema):
    submissionContent: str


class DocumentDraftResult(BaseSchema):
    analysisNo: int
    documentType: OutputDocumentType
    contentJson: AppealClaimContentJson | SupplementStatementContentJson


class DocumentDraftRequest(BaseSchema):
    analysisNo: int = Field(gt=0)
    documentType: OutputDocumentType
    caseInfo: CaseInfo
    legalIssueAnalysisResult: LegalIssueAnalysisResult
    strategyPrecedentAnalysisResult: StrategyPrecedentAnalysisResult
    preparedEvidenceList: list[str] | None = None


class DocumentDraftResponse(ApiResponse[DocumentDraftResult]):
    pass
