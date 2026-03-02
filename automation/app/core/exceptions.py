from fastapi import HTTPException

class UnauthorizedException(HTTPException):
    def __init__(self, detail="Unauthorized"):
        super().__init__(status_code=401, detail=detail)

class PlatformAPIException(HTTPException):
    def __init__(self, detail="Platform API Error"):
        super().__init__(status_code=400, detail=detail)

class RateLimitException(HTTPException):
    def __init__(self, detail="Rate limit exceeded"):
        super().__init__(status_code=429, detail=detail)