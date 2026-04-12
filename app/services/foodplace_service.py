import os
import shutil
import app.config.cloudinary
import cloudinary.uploader
import cloudinary.api
from app.schemas.foodplace import FoodPlaceCreate
from app.repositories.foodplace import FoodPlaceRepository

UPLOAD_DIR = "app/static/uploads"

class FoodPlaceService:
    def __init__(self, repo):
        self.repo = repo

    def create_food_place(self, data: FoodPlaceCreate, place_image, menu_image):

        place_url = None
        menu_url = None

        # Upload place image to Cloudinary
        if place_image and place_image.filename:
            result = cloudinary.uploader.upload(
                place_image.file,
                folder="campus_eats/places"
            )
            place_url = result["secure_url"]

        if menu_image and menu_image.filename:
            result = cloudinary.uploader.upload(
                menu_image.file,
                folder="campus_eats/menus"
            )
            menu_url = result["secure_url"]

        food_place = FoodPlace(
            name=data.name,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            place_url=place_url,
            menu_url=menu_url
        )

        return self.repo.create(food_place)

        '''
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
        '''

    def update_food_place(self, place_id, name, description, latitude, longitude, place_image, menu_image):

        place = self.repo.get_by_id(place_id)

        if not place:
            raise Exception("Food place not found")

        # Update basic fields
        place.name = name
        place.description = description
        place.latitude = latitude
        place.longitude = longitude

        if place_image and place_image.filename:
            result = cloudinary.uploader.upload(
                place_image.file,
                folder="campus_eats/places"
            )
            place.place_url = result["secure_url"]

        if menu_image and menu_image.filename:
            result = cloudinary.uploader.upload(
                menu_image.file,
                folder="campus_eats/menus"
            )
            place.menu_url = result["secure_url"]

        return self.repo.update(place)

        '''
        # replace images only if new ones are uploaded
        if place_image and place_image.filename:
            place_path = f"{UPLOAD_DIR}/places/{place_image.filename}"

            with open(place_path, "wb") as buffer:
                shutil.copyfileobj(place_image.file, buffer)

            place.place_url = f"/static/uploads/places/{place_image.filename}"

        if menu_image and menu_image.filename:
            menu_path = f"{UPLOAD_DIR}/menu/{menu_image.filename}"

            with open(menu_path, "wb") as buffer:
                shutil.copyfileobj(menu_image.file, buffer)

            place.menu_url = f"/static/uploads/menu/{menu_image.filename}"
        '''
        
    
    def delete_food_place(self, place_id: int):
        #return self.repo.delete(place_id)
        place = self.repo.get_by_id(place_id)

        if not place:
            return None

        #delete images from Cloudinary
        if place.place_url:
            url_parts = place.place_url.split("/upload/")[1]
            public_id = "/".join(url_parts.split("/")[1:]).rsplit(".", 1)[0]
            cloudinary.uploader.destroy(public_id)

        if place.menu_url:
            url_parts = place.menu_url.split("/upload/")[1]
            public_id = "/".join(url_parts.split("/")[1:]).rsplit(".", 1)[0]
            cloudinary.uploader.destroy(public_id)

        return self.repo.delete(place_id)
      