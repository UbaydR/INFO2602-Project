from sqlmodel import Session, select
from app.models.review import Review


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, review: Review) -> Review:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_by_user_and_place(self, user_id: int, food_place_id: int):
        return self.db.exec(
            select(Review).where(
                Review.user_id == user_id,
                Review.food_place_id == food_place_id
            )
        ).first()

    def get_all_by_place(self, food_place_id: int):
        return self.db.exec(
            select(Review).where(Review.food_place_id == food_place_id)
        ).all()

    def update(self, review: Review) -> Review:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review_id: int):
        review = self.db.get(Review, review_id)
        if not review:
            raise Exception("Review not found")
        self.db.delete(review)
        self.db.commit()
        return True
