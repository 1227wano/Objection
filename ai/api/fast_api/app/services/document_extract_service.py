from app.core.exceptions import ServiceException
from app.schemas.common import DocumentExtractResult, ParsedFields
from app.schemas.document_extract import DocumentExtractRequest, DocumentExtractResponse
from app.schemas.enums import InputDocumentType, Stage, Status


def extractDocument(request: DocumentExtractRequest) -> DocumentExtractResponse:
    documentTypeByStage = {
        Stage.APPEAL: InputDocumentType.NOTICE,
        Stage.ANSWER_RESPONSE: InputDocumentType.ANSWER,
        Stage.DECISION_REVIEW: InputDocumentType.DECISION,
    }
    documentType = documentTypeByStage.get(request.stage)
    if documentType is None:
        raise ServiceException("failed to determine documentType from stage")

    return DocumentExtractResponse(
        caseNo=request.caseNo,
        govDocNo=request.govDocNo,
        status=Status.SUCCESS,
        message="document extracted successfully",
        result=DocumentExtractResult(
            documentType=documentType,
            isValidForStage=True,
            invalidReason=None,
            caseTitle="청소년 주류 제공에 따른 영업정지 처분 사건",
            title="영업정지처분 통지서",
            rawText="문서 전체 원문...",
            summary=(
                "2026-03-01 식품위생법 위반을 이유로 영업정지 2개월 처분을 "
                "통지한 문서"
            ),
            parsedFields=ParsedFields(
                disposalDate="2026-03-01",
                awareDate="2026-03-03",
                agencyName="서울특별시 강남구청",
                sanctionType="영업정지",
                sanctionDays=60,
                businessName="재현포차",
                businessAddress="서울특별시 강남구 ...",
            ),
            searchHints=[
                "청소년 주류 제공",
                "위조 신분증",
                "영업정지",
                "이유제시",
                "사전통지",
                "의견제출",
                "사실오인",
                "처분 과중",
                "식품위생법",
                "행정절차법",
            ],
        ),
        warnings=[],
    )
