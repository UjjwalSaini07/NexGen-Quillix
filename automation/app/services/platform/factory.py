from app.services.platform.instagram_service import InstagramService
from app.services.platform.facebook_service import FacebookService
from app.services.platform.linkedin_service import LinkedInService
from app.services.platform.x_service import XService
from app.services.platform.youtube_service import YouTubeService
from app.services.platform.whatsapp_service import WhatsAppService

class PlatformFactory:

    @staticmethod
    def get_service(platform, account):
        if platform == "instagram":
            return InstagramService(account["access_token"], account["platform_user_id"])
        if platform == "facebook":
            return FacebookService(account["access_token"])
        if platform == "linkedin":
            return LinkedInService(account["access_token"])
        if platform == "x":
            return XService(account["access_token"])
        if platform == "youtube":
            return YouTubeService(account["access_token"])
        if platform == "whatsapp":
            return WhatsAppService(account["access_token"])
        raise Exception("Unsupported platform")