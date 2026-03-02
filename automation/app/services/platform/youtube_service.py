import requests

class YouTubeService:

    def __init__(self, access_token):
        self.token = access_token

    def publish(self, post):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        payload = {
            "snippet": {
                "title": post["content"][:50],
                "description": post["content"]
            },
            "status": {
                "privacyStatus": "public"
            }
        }

        return requests.post(
            "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
            headers=headers,
            json=payload
        ).json()