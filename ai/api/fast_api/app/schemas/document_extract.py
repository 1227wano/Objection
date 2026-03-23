from pydantic import Field

from app.schemas.common import BaseSchema, CaseGovResponse, DocumentExtractResult
from app.schemas.enums import Stage


class DocumentExtractRequest(BaseSchema):
    caseNo: int = Field(gt=0)
    govDocNo: int = Field(gt=0)
    stage: Stage
    fileKey: str


class DocumentExtractResponse(CaseGovResponse[DocumentExtractResult]):
    pass
