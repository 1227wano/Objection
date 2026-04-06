from enum import Enum


class InputDocumentType(str, Enum):
    NOTICE = "NOTICE"
    ANSWER = "ANSWER"
    DECISION = "DECISION"


class OutputDocumentType(str, Enum):
    APPEAL_CLAIM = "APPEAL_CLAIM"
    SUPPLEMENT_STATEMENT = "SUPPLEMENT_STATEMENT"


class LegalIssueType(str, Enum):
    FACT_MISUNDERSTANDING = "사실오인"
    PROCEDURAL_DEFECT = "절차적하자"
    ABUSE_OF_DISCRETION = "재량권 일탈·남용"


class RiskLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ClaimType(str, Enum):
    CANCEL = "CANCEL"
    INVALID = "INVALID"
    ORDER = "ORDER"


class AppealPossibility(str, Enum):
    HIGH = "H"
    MEDIUM = "M"
    LOW = "L"
    ZERO = "Z"


class Status(str, Enum):
    SUCCESS = "SUCCESS"
    FAIL = "FAIL"
