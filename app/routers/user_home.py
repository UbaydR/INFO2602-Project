from fastapi import APIRouter, HTTPException, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status
from app.dependencies.session import SessionDep
from app.dependencies.auth import AuthDep, IsUserLoggedIn, get_current_user, is_admin
from . import router, templates
from app.repositories.review import ReviewRepository
from app.services.review_service import ReviewService


@router.get("/app", response_class=HTMLResponse)
async def user_home_view(
    request: Request,
    user: AuthDep,
    db:SessionDep
):
    return templates.TemplateResponse(
        request=request, 
        name="app.html",
        context={
            "user": user
        }
    )


@router.get("/api/food-places/{place_id}/reviews")
def get_reviews(place_id: int, db: SessionDep, request: Request):
    repo = ReviewRepository(db)
    service = ReviewService(repo, db)

    current_user_id = None
    try:
        from app.dependencies.auth import get_current_user
        import asyncio
        loop = asyncio.new_event_loop()
        user = loop.run_until_complete(get_current_user(request, db))
        current_user_id = user.id
        loop.close()
    except Exception:
        pass

    return service.get_reviews_for_place(place_id, current_user_id)


@router.post("/api/food-places/{place_id}/reviews")
def submit_review(
    place_id: int,
    db: SessionDep,
    user: AuthDep,
    rating: int = Form(...),
    comment: str = Form(None)
):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    repo = ReviewRepository(db)
    service = ReviewService(repo, db)
    review = service.add_or_update_review(user.id, place_id, rating, comment)

    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
        "message": "Review submitted successfully"
    }


@router.delete("/api/reviews/{review_id}")
def delete_review(
    review_id: int,
    db: SessionDep,
    user: AuthDep
):
    repo = ReviewRepository(db)
    from app.models.review import Review
    review = db.get(Review, review_id)

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    repo.delete(review_id)
    return {"message": "Review deleted successfully"}