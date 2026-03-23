from app.schemas.common import (
    MainPoint,
    PrecedentInfo,
    StrategyPrecedentAnalysisResult,
)
from app.schemas.enums import Status
from app.schemas.strategy_precedent_analysis import (
    StrategyPrecedentAnalysisRequest,
    StrategyPrecedentAnalysisResponse,
)


def analyzeStrategyPrecedent(
    request: StrategyPrecedentAnalysisRequest,
) -> StrategyPrecedentAnalysisResponse:
    return StrategyPrecedentAnalysisResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="strategy precedent analysis completed",
        result=StrategyPrecedentAnalysisResult(
            claimType="CANCEL",
            appealPossibility="MEDIUM",
            strategySummary=(
                "사실오인과 처분 과중을 중심으로 주장하고, 집행정지를 함께 "
                "검토하는 전략이 적절합니다."
            ),
            mainPoints=[
                MainPoint(
                    point="위조 신분증 제시로 인한 사실오인",
                    reason="업주의 주의의무 이행 여부를 중심으로 방어할 수 있습니다.",
                    sourceText=(
                        "직원이 신분증 검사를 했으나 손님이 위조 신분증을 제시한 "
                        "것으로 보입니다."
                    ),
                ),
                MainPoint(
                    point="처분의 과중성",
                    reason="관리 노력과 구체적 사정을 고려할 때 감경 주장이 가능합니다.",
                    sourceText="업주로서 최선을 다했는데 과도한 처분이라고 생각합니다.",
                ),
            ],
            stayRecommended=True,
            precedentInfos=[
                PrecedentInfo(
                    precedentNo="P-1001",
                    precedentName="청소년 주류제공 관련 감경 사례",
                    matchReason="위조 신분증 제시 및 주의의무 이행 주장과 유사",
                    usagePoint="사실오인 주장 근거",
                ),
                PrecedentInfo(
                    precedentNo="P-2033",
                    precedentName="영업정지 감경 사례",
                    matchReason="초범 및 교육 이력 참작 사정이 유사",
                    usagePoint="처분 과중 주장 근거",
                ),
            ],
            recommendedEvidence=[
                "CCTV 영상",
                "직원 교육일지",
                "매장 운영 매뉴얼",
                "매출 자료",
            ],
        ),
        warnings=[],
    )
