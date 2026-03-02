import requests

class WhatsAppService:

    def __init__(self, access_token, phone_number_id):
        self.token = access_token
        self.phone_number_id = phone_number_id

    def send_message(self, to_number, message):
        url = f"https://graph.facebook.com/v19.0/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {"body": message}
        }

        return requests.post(url, headers=headers, json=payload).json()