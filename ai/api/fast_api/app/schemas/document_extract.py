from pydantic import Field

from app.schemas.common import BaseSchema, CaseResponse, DocumentExtractResult
from app.schemas.enums import InputDocumentType


class DocumentExtractRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    # govDocNo: int = Field(gt=0)
    sourceDocumentType: InputDocumentType
    fileKey: str


class DocumentExtractResponse(CaseResponse[DocumentExtractResult]):
    pass