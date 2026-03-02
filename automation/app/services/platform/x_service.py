import requests

class XService:

    def __init__(self, access_token):
        self.token = access_token

    def publish(self, post):
        headers = {
            "Authorization": f"Bearer {self.token}"
        }

        return requests.post(
            "https://api.twitter.com/2/tweets",
            headers=headers,
            json={"text": post["content"]}
        ).json()