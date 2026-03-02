from langchain_groq import ChatGroq
import os

class GroqService:

    def __init__(self):
        self.llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="mixtral-8x7b-32768"
        )

    def generate_post(self, niche, tone):
        prompt = f"""
        Create a viral social media post about {niche}.
        Tone: {tone}.
        Include hook + CTA + hashtags.
        """
        return self.llm.invoke(prompt).content

    def generate_reply(self, comment):
        prompt = f"Reply engagingly to this comment: {comment}"
        return self.llm.invoke(prompt).content