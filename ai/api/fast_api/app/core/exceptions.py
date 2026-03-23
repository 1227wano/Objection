class AppException(Exception):
    def __init__(
        self,
        message: str,
        statusCode: int = 500,
    ) -> None:
        self.message = message
        self.statusCode = statusCode
        super().__init__(message)


class InvalidRequestException(AppException):
    def __init__(self, message: str = "invalid request") -> None:
        super().__init__(message=message, statusCode=400)


class ServiceException(AppException):
    def __init__(self, message: str = "internal service error") -> None:
        super().__init__(message=message, statusCode=500)
