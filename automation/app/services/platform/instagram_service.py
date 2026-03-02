import requests

class InstagramService:

    def __init__(self, access_token, ig_user_id):
        self.token = access_token
        self.user_id = ig_user_id

    def publish(self, post):
        container = requests.post(
            f"https://graph.facebook.com/v19.0/{self.user_id}/media",
            data={
                "image_url": post["media_url"],
                "caption": post["content"],
                "access_token": self.token
            }
        ).json()

        creation_id = container["id"]

        requests.post(
            f"https://graph.facebook.com/v19.0/{self.user_id}/media_publish",
            data={
                "creation_id": creation_id,
                "access_token": self.token
            }
        )