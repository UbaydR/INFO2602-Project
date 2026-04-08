import os
from uuid import uuid4
from fastapi import UploadFile
from app.models.foodplace import FoodPlace
from app.schemas.foodplace import FoodPlaceCreate
from app.repositories.foodplace import FoodPlaceRepository

UPLOAD_DIR = "app/static/uploads"

class FoodPlaceService:
    def __init__(self, repo: FoodPlaceRepository):
        self.repo = repo

    def save_file(self, file: UploadFile):
        if not file:
            return None

        filename = f"{uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            buffer.write(file.file.read())

        return f"/static/uploads/{filename}"

    def create_food_place(self, data: FoodPlaceCreate, place_image: UploadFile, menu_image: UploadFile):
        place_image_path = self.save_file(place_image)
        menu_image_path = self.save_file(menu_image)

        food_place = FoodPlace(
            name=data.name,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            place_image=place_image_path,
            menu_image=menu_image_path
        )

        return self.repo.create(food_place)