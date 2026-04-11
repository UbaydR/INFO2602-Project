import os
import shutil
from app.models.foodplace import FoodPlace
from app.schemas.foodplace import FoodPlaceCreate
from app.repositories.foodplace import FoodPlaceRepository

UPLOAD_DIR = "app/static/uploads"

class FoodPlaceService:
    def __init__(self, repo):
        self.repo = repo

    def create_food_place(self, data: FoodPlaceCreate, place_image, menu_image):

        place_url = None
        menu_url = None

        # Ensure folders exist
        os.makedirs(f"{UPLOAD_DIR}/places", exist_ok=True)
        os.makedirs(f"{UPLOAD_DIR}/menu", exist_ok=True)

        if place_image:
            place_path = f"{UPLOAD_DIR}/places/{place_image.filename}"

            with open(place_path, "wb") as buffer:
                shutil.copyfileobj(place_image.file, buffer)

            place_url = f"/static/uploads/places/{place_image.filename}"

        if menu_image:
            menu_path = f"{UPLOAD_DIR}/menu/{menu_image.filename}"

            with open(menu_path, "wb") as buffer:
                shutil.copyfileobj(menu_image.file, buffer)

            menu_url = f"/static/uploads/menu/{menu_image.filename}"

        food_place = FoodPlace(
            name=data.name,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            place_url=place_url,
            menu_url=menu_url
        )

        return self.repo.create(food_place)

