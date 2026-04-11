from fastapi import APIRouter, HTTPException, Depends, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status
from sqlmodel import select
from app.dependencies.session import SessionDep
from app.dependencies.auth import AdminDep, IsUserLoggedIn, get_current_user, is_admin
from . import router, templates
from app.models.foodplace import FoodPlace
from app.schemas.foodplace import FoodPlaceCreate
from app.repositories.foodplace import FoodPlaceRepository
from app.services.foodplace_service import FoodPlaceService

UPLOAD_DIR = "app/static/uploads"

@router.get("/api/food-places")
def get_all_food_places(db: SessionDep):
    return db.exec(select(FoodPlace)).all()

@router.get("/api/food-places/{place_id}")
def get_food_place(place_id: int, db: SessionDep):
    place = db.get(FoodPlace, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Not found")
    return place

@router.post("/admin/food-places")
async def create_food_place(db: SessionDep, admin: AdminDep,
    name: str = Form(...),
    description: str = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    place_image: UploadFile = File(None),
    menu_image: UploadFile = File(None)
):
    repo = FoodPlaceRepository(db)
    service = FoodPlaceService(repo)

    data = FoodPlaceCreate(
        name=name,
        description=description,
        latitude=latitude,
        longitude=longitude
    )

    place = service.create_food_place(data, place_image, menu_image)

    return {"id": place.id, "name": place.name} 



@router.get("/admin", response_class=HTMLResponse)
async def admin_home_view(
    request: Request,
    user: AdminDep,
    db:SessionDep
):
    return templates.TemplateResponse(
        request=request, 
        name="admin.html",
        context={
            "user": user
        }
    )