from fastapi import APIRouter
from app.database import db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import user_schema

router = APIRouter()

@router.post("/register")
async def register(data: dict):
    user = user_schema(data["email"], hash_password(data["password"]))
    await db.users.insert_one(user)
    return {"message": "User created"}

@router.post("/login")
async def login(data: dict):
    user = await db.users.find_one({"email": data["email"]})
    if not user or not verify_password(data["password"], user["password_hash"]):
        return {"error": "Invalid credentials"}

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token}