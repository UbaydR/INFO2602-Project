import typer
from app.database import create_db_and_tables, get_cli_session, drop_all
from app.models import *
from fastapi import Depends
from sqlmodel import select
from sqlalchemy.exc import IntegrityError
from app.utilities.security import encrypt_password
from app.models.user import UserBase, User

app = typer.Typer()

@app.command()
def initialize():
    with get_cli_session() as db:
        #drop_all() 
        create_db_and_tables() 
        
        existing_bob = db.exec(select(User).where(User.username == 'bob')).first()

        #Check if the admin user already exists
        if not existing_bob:
            bob = UserBase(username='bob', email='bob@mail.com', password=encrypt_password("bobpass"), role="admin")
            bob_db = User.model_validate(bob)

            db.add(bob_db)
            db.commit()
            print("Admin user 'bob' created")
        else:
            print("Admin user 'bob' already exists")

        # Check if the regular user already exists
        existing_joe = db.exec(select(User).where(User.username == 'joe')).first()

        if not existing_joe:
            joe = UserBase(username='joe', email='joe@mail.com', password=encrypt_password("joepass"), role="regular_user")
            joe_db = User.model_validate(joe)

            db.add(joe_db)
            db.commit()
            print("Regular user 'joe' created")
        else:
            print("Regular user 'joe' already exists")

        print("Database Initialized")


if __name__ == "__main__":
    initialize()