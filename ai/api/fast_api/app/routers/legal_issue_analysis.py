from fastapi import APIRouter

from app.schemas.legal_issue_analysis import (
    LegalIssueAnalysisRequest,
    LegalIssueAnalysisResponse,
)
from app.services.legal_issue_analysis_service import analyzeLegalIssue

router = APIRouter(
    prefix="/ai/agents/legal-issue-analysis",
    tags=["legalIssueAnalysis"],
)


@router.post("", response_model=LegalIssueAnalysisResponse)
def legalIssueAnalysis(
    request: LegalIssueAnalysisRequest,
) -> LegalIssueAnalysisResponse:
    return analyzeLegalIssue(request)
