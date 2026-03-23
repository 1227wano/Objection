from fastapi import APIRouter

from app.schemas.strategy_precedent_analysis import (
    StrategyPrecedentAnalysisRequest,
    StrategyPrecedentAnalysisResponse,
)
from app.services.strategy_precedent_analysis_service import (
    analyzeStrategyPrecedent,
)

router = APIRouter(
    prefix="/ai/agents/strategy-precedent-analysis",
    tags=["strategyPrecedentAnalysis"],
)


@router.post("", response_model=StrategyPrecedentAnalysisResponse)
def strategyPrecedentAnalysis(
    request: StrategyPrecedentAnalysisRequest,
) -> StrategyPrecedentAnalysisResponse:
    return analyzeStrategyPrecedent(request)
