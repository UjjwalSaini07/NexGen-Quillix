from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from typing import List, Dict
import re
import os

class LinkedInPostGenerator:
    def __init__(self, api_key: str = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
            temperature=0.7,
        )

        self.templates = {
            "informative": """
Write a LinkedIn post about: {prompt}
Tone: {tone}
Approximate length: {words} words.
{hashtags}
{emojis}
Strictly output only the post content, no other text or comments and any fillers. DO NOT OUTPUT ANYTHING ELSE
""",
            "casual": """
Write a casual LinkedIn post about: {prompt}
Tone: {tone}
Approximate length: {words} words.
{hashtags}
{emojis}
Strictly output only the post content, no other text or comments and any fillers. DO NOT OUTPUT ANYTHING ELSE
""",
            "inspirational": """
Write an inspirational LinkedIn post about: {prompt}
Tone: {tone}
Approximate length: {words} words.
{hashtags}
{emojis}
Strictly output only the post content, no other text or comments and any fillers. DO NOT OUTPUT ANYTHING ELSE
"""
        }

        self.tones = [
            "professional",
            "friendly",
            "enthusiastic",
            "authoritative",
            "casual",
        ]

    def generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 5 relevant hashtags for a LinkedIn post about '{prompt}'. "
            "Return ONLY the hashtags separated by spaces."
        )
        hashtags = self.llm.invoke(hashtag_prompt)
        return hashtags.content.strip()

    def add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Add relevant emojis to this LinkedIn post to make it more engaging:\n\n{text}\n\n"
            "Return ONLY the post with emojis."
        )
        result = self.llm.invoke(emoji_prompt)
        return result.content.strip()

    def analyze_post(self, post: str) -> Dict:
        return {
            "word_count": len(re.findall(r"\w+", post)),
            "char_count": len(post),
            "sentence_count": len(re.findall(r"[.!?]+", post)),
        }

    def generate_post(
        self,
        prompt: str,
        words: int = 200,
        tone: str = "professional",
        template: str = "informative",
        add_hashtags: bool = False,
        add_emojis: bool = False,
        variations: int = 1,
    ) -> List[Dict]:
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if variations < 1 or variations > 6:
            raise ValueError("Variations must be between 1 and 6.")

        if tone not in self.tones:
            raise ValueError(f"Invalid tone. Available: {', '.join(self.tones)}")

        if template not in self.templates:
            raise ValueError(f"Invalid template. Available: {', '.join(self.templates.keys())}")

        hashtags = ""
        hashtags_str = ""
        if add_hashtags:
            hashtags = self.generate_hashtags(prompt)
            hashtags_str = f"Include these hashtags: {hashtags}"

        results = []
        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=["prompt", "tone", "words", "hashtags", "emojis"],
                template=self.templates[template],
            )
            chain = prompt_template | self.llm

            response = chain.invoke(
                {
                    "prompt": prompt,
                    "tone": tone,
                    "words": words,
                    "hashtags": hashtags_str,
                    "emojis": "Add relevant emojis." if add_emojis else "",
                }
            )
            generated_post = response.content.strip()

            if add_emojis:
                generated_post = self.add_emojis(generated_post)

            analysis = self.analyze_post(generated_post)

            results.append({
                "post": generated_post,
                "analysis": analysis,
                "tone": tone,
                "category": template,
                "hashtags": hashtags if add_hashtags else None,
            })

        return results
