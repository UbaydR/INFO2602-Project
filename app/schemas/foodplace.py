from app.models.foodplace import FoodPlace
from sqlmodel import SQLModel
from pydantic import EmailStr
from typing import Optional

class FoodPlaceCreate(SQLModel):
    name: str
    description: Optional[str]
    latitude: float
    longitude: float