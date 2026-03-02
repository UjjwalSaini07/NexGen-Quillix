from app.services.ai.groq_service import GroqService

class EngagementEngine:

    def __init__(self):
        self.ai = GroqService()

    def process_comment(self, platform_service, comment):
        reply = self.ai.generate_reply(comment["text"])
        platform_service.reply(comment["id"], reply)