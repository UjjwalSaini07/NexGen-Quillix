import re
import os
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from typing import List, Dict, Optional

class XPostGenerator:
    def __init__(self, api_key: str = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
            temperature=0.7,
        )

        self.templates = {
            "professional": """
You are a professional social media strategist tasked with writing a high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Formal and suitable for X with polished and respectful language

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}
{hashtags}
{emojis}

Your task:
- Write a polished, professional X post that clearly communicates the topic to the specified audience.
- Use a tone and wording style appropriate for that audience.
- Ensure the message is relevant, respectful, and avoids jargon unless the audience is technical.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final X post content. No instructions, meta-text, or labels.
"""
        }

        self.tones = [
            "formal", "informal", "friendly", "neutral", "assertive", "empathetic", "humorous", 
            "optimistic", "pessimistic", "inspirational", "encouraging", "persuasive", "direct", "candid",
        ]

    # Author: "Ujjwal Saini"
    def generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 10 relevant and currently trending X hashtags for a post about '{prompt}'. "
            "Return ONLY the hashtags, separated by spaces. Do not include punctuation, explanations, or comments."
        )
        hashtags = self.llm.invoke(hashtag_prompt)
        return hashtags.content.strip()

    def add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Enhance the following X post by adding relevant and appropriate emojis to increase engagement:\n\n{text}\n\n"
            "Return ONLY the revised post with emojis added. Do not include any explanations or extra text."
        )
        result = self.llm.invoke(emoji_prompt)
        return result.content.strip()
    
    def add_mentions(self, text: str) -> str:
        mention_prompt = (
            f"Enhance the following X post by adding relevant and appropriate mentions to increase engagement:\n\n{text}\n\n"
            "Return ONLY the revised post with mentions added. Do not include any explanations or extra text."
        )
        result = self.llm.invoke(mention_prompt)
        return result.content.strip()

    def analyze_post(self, post: str) -> Dict:
        return {
            "word_count": len(re.findall(r"\w+", post)),
            "char_count": len(post),
            "sentence_count": len(re.findall(r"[.!?]+", post)),
        }
    
    def get_language_name(self, code):
        mapping = {
            "en": "English", "fr": "French", "hi": "Hindi", "es": "Spanish", "de": "German", 
            "zh": "Chinese", "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese", "ru": "Russian",
        }
        return mapping.get(code, "English")

    def generate_post(
        self,
        prompt: str,
        words: int = 300,
        tone: str = "optimistic",
        template: str = "professional",
        add_hashtags: bool = False,
        add_emojis: bool = False,
        add_mentions: bool = False,
        add_event: bool = False,
        variations: int = 1,
        postTweetTypeOptions: Optional[str] = None,
        postgoal: Optional[str] = None,
        eventDetails: Optional[str] = None,
        audience: Optional[str] = None,
        language: str = "en",
    ) -> List[Dict]:
        
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")
        if not (1 <= variations <= 10):
            raise ValueError("Variations must be between 1 and 10.")
        if tone not in self.tones:
            raise ValueError(f"Invalid tone. Available: {', '.join(self.tones)}")
        if template not in self.templates:
            raise ValueError(f"Invalid template '{template}'. Available: {', '.join(self.templates.keys())}")

        hashtags_str = f"Include these hashtags: {self.generate_hashtags(prompt)}" if add_hashtags else ""
        emojis_str = "Add relevant emojis." if add_emojis else ""
        audience_str = audience or "General audience"
        language_name = self.get_language_name(language)
        event_section = f"Event Details: {eventDetails}" if add_event and eventDetails else ""

        results = []
        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=[
                    "prompt", "tone", "words", "hashtags", "emojis", "audience",
                    "postTweetTypeOptions", "postgoal", "event_section", "language"
                ],
                template=self.templates[template],
            )
            chain = prompt_template | self.llm

            response = chain.invoke({
                "prompt": prompt,
                "tone": tone,
                "words": words,
                "hashtags": hashtags_str,
                "emojis": emojis_str,
                "audience": audience_str,
                "postTweetTypeOptions": postTweetTypeOptions or "",
                "postgoal": postgoal or "",
                "event_section": event_section,
                "language": language_name,
            })

            generated_post = response.content.strip()

            if add_emojis:
                generated_post = self.add_emojis(generated_post)
            if add_mentions:
                generated_post = self.add_mentions(generated_post)

            analysis = self.analyze_post(generated_post)

            results.append({
                "post": generated_post,
                "analysis": analysis,
                "tone": tone,
                "category": template,
                "hashtags": hashtags_str if add_hashtags else None,
                "postTweetTypeOptions": postTweetTypeOptions,
                "postgoal": postgoal,
                "eventDetails": eventDetails if add_event else None,
                "audience": audience,
                "language": language_name
            })
        return results
