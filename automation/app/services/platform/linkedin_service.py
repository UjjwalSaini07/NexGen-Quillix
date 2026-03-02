import requests

class LinkedInService:

    def __init__(self, access_token):
        self.token = access_token

    def publish(self, post):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        payload = {
            "author": "urn:li:person:YOUR_ID",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": post["content"]},
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }

        return requests.post(
            "https://api.linkedin.com/v2/ugcPosts",
            headers=headers,
            json=payload
        ).json()