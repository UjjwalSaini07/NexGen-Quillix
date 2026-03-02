import requests
from datetime import datetime, timedelta
from app.database import db

class TokenRefreshService:

    async def refresh_meta_token(self, account):
        """
        Refresh token for Facebook & Instagram (Meta)
        """
        url = "https://graph.facebook.com/v19.0/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": account["client_id"],
            "client_secret": account["client_secret"],
            "fb_exchange_token": account["refresh_token"]
        }

        response = requests.get(url, params=params).json()

        if "access_token" in response:
            new_token = response["access_token"]

            await db.social_accounts.update_one(
                {"_id": account["_id"]},
                {
                    "$set": {
                        "access_token": new_token,
                        "expires_at": datetime.utcnow() + timedelta(days=60)
                    }
                }
            )

        return response