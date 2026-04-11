from sqlmodel import Session
from app.models.foodplace import FoodPlace

class FoodPlaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, food_place: FoodPlace):
        self.db.add(food_place)
        self.db.commit()
        self.db.refresh(food_place)
        return food_place
    