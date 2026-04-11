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
    
    def get_by_id(self, place_id):
        return self.db.get(FoodPlace, place_id)

    def update(self, place):
        self.db.add(place)
        self.db.commit()
        self.db.refresh(place)
        return place

    def delete(self, place_id: int):
        place = self.db.get(FoodPlace, place_id)
        if not place:
            raise Exception("Food place not found")

        self.db.delete(place)
        self.db.commit()
        return True
