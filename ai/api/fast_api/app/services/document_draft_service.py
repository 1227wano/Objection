from app.schemas.common import DocumentDraftResult, DraftDocumentContent
from app.schemas.document_draft import DocumentDraftRequest, DocumentDraftResponse
from app.schemas.enums import Status


def createDocumentDraft(request: DocumentDraftRequest) -> DocumentDraftResponse:
    return DocumentDraftResponse(
        status=Status.SUCCESS,
        message="document draft created",
        result=DocumentDraftResult(
            analysisNo=request.analysisNo,
            documentType=request.documentType,
            title="행정심판청구서",
            contentJson=DraftDocumentContent(
                claimPurpose=(
                    "피청구인이 2026.03.01. 청구인에게 한 영업정지 2개월 처분을 "
                    "취소한다."
                ),
                claimReason=(
                    "청구인은 신분증 확인 절차를 이행하였고, 위조 신분증 제시 가능성이 "
                    "존재하므로 사실오인의 여지가 있습니다."
                ),
                factSummary="사건 경위 요약...",
                legalArguments=[
                    "사실오인",
                    "처분 과중",
                ],
                evidenceList=[
                    "CCTV 영상",
                    "직원 교육일지",
                ],
            ),
        ),
        warnings=[],
    )
