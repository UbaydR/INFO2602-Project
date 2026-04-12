from sqlmodel import Field, SQLModel, UniqueConstraint
from typing import Optional
from datetime import datetime


class Review(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("user_id", "food_place_id", name="uq_user_food_place"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    food_place_id: int = Field(foreign_key="foodplace.id", index=True)
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
