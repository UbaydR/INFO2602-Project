from sqlmodel import Field, SQLModel
from typing import Optional
from pydantic import EmailStr

class FoodPlace(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    latitude: float
    longitude: float
    place_url: Optional[str] = None
    menu_url: Optional[str] = None
