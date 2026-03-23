from enum import Enum


class Stage(str, Enum):
    APPEAL = "APPEAL"
    ANSWER_RESPONSE = "ANSWER_RESPONSE"
    DECISION_REVIEW = "DECISION_REVIEW"


class InputDocumentType(str, Enum):
    NOTICE = "NOTICE"
    ANSWER = "ANSWER"
    DECISION = "DECISION"


class OutputDocumentType(str, Enum):
    APPEAL_CLAIM = "APPEAL_CLAIM"
    SUPPLEMENT_STATEMENT = "SUPPLEMENT_STATEMENT"


class Status(str, Enum):
    SUCCESS = "SUCCESS"
    FAIL = "FAIL"
