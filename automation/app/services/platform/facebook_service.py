import requests

class FacebookService:

    def __init__(self, access_token, page_id=None):
        self.token = access_token
        self.page_id = page_id

    def publish(self, post):
        url = f"https://graph.facebook.com/v19.0/{self.page_id}/feed"
        return requests.post(url, data={
            "message": post["content"],
            "access_token": self.token
        }).json()

    def fetch_comments(self):
        return []