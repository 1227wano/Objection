from app.schemas.common import LegalIssue, LegalIssueAnalysisResult
from app.schemas.enums import Status
from app.schemas.legal_issue_analysis import (
    LegalIssueAnalysisRequest,
    LegalIssueAnalysisResponse,
)


def analyzeLegalIssue(
    request: LegalIssueAnalysisRequest,
) -> LegalIssueAnalysisResponse:
    return LegalIssueAnalysisResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="legal issue analysis completed",
        result=LegalIssueAnalysisResult(
            legalIssueSummary=(
                "이 사건은 사실오인 가능성과 처분 비례성 측면에서 법적 쟁점이 존재합니다."
            ),
            legalWeaknessFound=True,
            legalIssues=[
                LegalIssue(
                    issueType="FACT_MISUNDERSTANDING",
                    description=(
                        "위조 신분증 제시 여부와 업주의 주의의무 이행 정도가 충분히 "
                        "반영되지 않았을 가능성이 있습니다."
                    ),
                    lawBasis="식품위생법 제44조",
                    basisText=(
                        "직원이 신분증 검사를 했으나 손님이 위조 신분증을 제시한 것으로 "
                        "보입니다."
                    ),
                    riskLevel="HIGH",
                ),
                LegalIssue(
                    issueType="PROPORTIONALITY",
                    description=(
                        "영업정지 2개월 처분이 구체적 사정에 비해 과중할 수 있습니다."
                    ),
                    lawBasis="행정법 일반원칙",
                    basisText="업주로서 최선을 다했는데 과도한 처분이라고 생각합니다.",
                    riskLevel="MEDIUM",
                ),
            ],
        ),
        warnings=[],
    )
