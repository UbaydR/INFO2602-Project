from app.repositories.review import ReviewRepository
from app.models.review import Review
from app.models.user import User
from sqlmodel import Session, select


class ReviewService:
    def __init__(self, repo: ReviewRepository, db: Session):
        self.repo = repo
        self.db = db

    def add_or_update_review(self, user_id: int, food_place_id: int, rating: int, comment: str = None):
        existing = self.repo.get_by_user_and_place(user_id, food_place_id)

        if existing:
            existing.rating = rating
            existing.comment = comment
            return self.repo.update(existing)
        else:
            review = Review(
                user_id=user_id,
                food_place_id=food_place_id,
                rating=rating,
                comment=comment
            )
            return self.repo.create(review)

    def get_reviews_for_place(self, food_place_id: int, current_user_id: int = None):
        reviews = self.repo.get_all_by_place(food_place_id)
        result = []

        for review in reviews:
            user = self.db.get(User, review.user_id)
            result.append({
                "id": review.id,
                "rating": review.rating,
                "comment": review.comment,
                "username": user.username if user else "Unknown",
                "created_at": review.created_at.isoformat(),
                "is_own": review.user_id == current_user_id if current_user_id else False
            })

        return result
