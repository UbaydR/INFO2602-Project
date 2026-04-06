from fastapi import APIRouter, HTTPException, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status
from app.dependencies.session import SessionDep
from app.dependencies.auth import AdminDep, IsUserLoggedIn, get_current_user, is_admin
from . import router, templates
from app.models.foodplace import FoodPlace

@router.post("/admin/food-places")
def create_food_place(
    name: str = Form(),
    latitude: float = Form(),
    longitude: float = Form(),
    db: SessionDep = None,
    admin: AdminDep = None
):
    food_place = FoodPlace(
        name=name,
        latitude=latitude,
        longitude=longitude
    )

    db.add(food_place)
    db.commit()

    return RedirectResponse("/admin/map", status_code=303)

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
