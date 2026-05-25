from pydantic import BaseModel, EmailStr
from typing import Optional

class ContactRequest(BaseModel):
    name: str
    email: str
    service: str
    message: Optional[str] = None
