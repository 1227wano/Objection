from app.schemas.document_draft import DocumentDraftRequest, DocumentDraftResponse
from app.schemas.document_review import DocumentReviewRequest, DraftDocument
from app.services.document_draft_service import createDocumentDraft
from app.services.document_review_service import reviewDocument


def createDocumentDraftOrchestration(
    request: DocumentDraftRequest,
) -> DocumentDraftResponse:
    initialDraftResult = createDocumentDraft(request)
    reviewRequest = DocumentReviewRequest(
        analysisNo=request.analysisNo,
        documentType=request.documentType,
        draftDocument=DraftDocument(
            title=None,
            contentJson=initialDraftResult.contentJson,
        ),
        caseInfo=request.caseInfo.model_dump(mode="python"),
        legalIssueAnalysisResult=request.legalIssueAnalysisResult.model_dump(
            mode="python"
        ),
        strategyPrecedentAnalysisResult=
        request.strategyPrecedentAnalysisResult.model_dump(mode="python"),
        preparedEvidenceList=request.preparedEvidenceList or [],
    )

    return reviewDocument(reviewRequest)
