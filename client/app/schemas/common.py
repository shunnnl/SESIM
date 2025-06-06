from pydantic import BaseModel
from typing import Optional, Any

class MessageResponse(BaseModel):
    message: str
    response: Optional[Any] = None
