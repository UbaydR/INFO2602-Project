from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class ReviewCreate(SQLModel):
    rating: int
    comment: Optional[str] = None


class ReviewResponse(SQLModel):
    id: int
    rating: int
    comment: Optional[str]
    username: str
    created_at: datetime
