from fastapi import APIRouter

router = APIRouter()

@router.get("/{platform}/login")
async def login(platform: str):
    return {"message": f"Redirect user to {platform} OAuth URL"}

@router.get("/{platform}/callback")
async def callback(platform: str, code: str):
    return {"message": f"Exchange code for token for {platform}"}