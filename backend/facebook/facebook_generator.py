import os
import re
from typing import List, Dict, Optional
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

class FacebookPostGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            temperature=0.7,
            max_tokens=1024
        )

        # Templates — fill in your real Facebook templates here
        self.templates = {
            "storytelling": """
You are a professional social media strategist writing an engaging Facebook post.

Topic: {prompt}
Language: {language} (write entirely in {language})
Tone: {tone}
Length: Around {words} words
Style: Casual, conversational, and optimized for Facebook engagement.

Target Audience: {audience}
Call to Action (CTA): {cta}
Post Type: {post_type}
Preferred Music Style: {music_preference} ({music_language})
Extra: {extra_instructions}
{hashtags}
{emojis}

Write ONE Facebook post. Make the tone resonate with the music preference provided, weaving in subtle references if appropriate.
Do not include meta text, labels, or markdown. Return ONLY the final post text.
"""
        }

        self.tones = [
            "trendy",
            "casual",
            "playful",
            "aesthetic",
            "funny",
            "witty",
            "chill",
            "relatable",
            "inspiring",
            "bold",
            "emotional",
        ]

    def _generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 18 relevant hashtags for a Facebook post about '{prompt}'. "
            "Return ONLY the hashtags, separated by spaces. Do not include punctuation, explanations, or comments."
        )
        result = self.llm.invoke(hashtag_prompt)
        return result.content.strip()

    def _add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Add relevant and engaging emojis to the following Facebook post:\n\n"
            f"{text}\n\nReturn ONLY the revised post with emojis added. Do not include any explanations or extra text."
        )
        result = self.llm.invoke(emoji_prompt)
        return result.content.strip()

    def _analyze_post(self, post: str) -> Dict:
        return {
            "word_count": len(re.findall(r"\w+", post)),
            "char_count": len(post),
            "sentence_count": len(re.findall(r"[.!?]+", post)),
        }

    def _get_language_name(self, code: str) -> str:
        mapping = {
            "en": "English", "fr": "French", "hi": "Hindi",
            "es": "Spanish", "de": "German", "zh": "Chinese",
            "ja": "Japanese", "ar": "Arabic", "pt": "Portuguese",
            "ru": "Russian"
        }
        return mapping.get(code.lower(), "English")

    def generate_post(
        self,
        prompt: str,
        words: int = 300,
        tone: str = "trendy",
        template: str = "storytelling",
        add_hashtags: bool = False,
        add_emojis: bool = False,
        add_music: bool = False,
        variations: int = 1,
        language: str = "en",
        call_to_action: Optional[str] = None,
        audience: Optional[str] = None,
        post_type: str = "Text Post",
        music_preference: Optional[str] = None,
        music_language: Optional[str] = None,
        extra_instructions: str = ""
    ) -> List[Dict]:

        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if not (1 <= variations <= 10):
            raise ValueError("Variations must be between 1 and 10.")

        if tone not in self.tones:
            raise ValueError(f"Invalid tone. Available: {', '.join(self.tones)}")

        if template not in self.templates:
            raise ValueError(f"Invalid template '{template}'. Available: {', '.join(self.templates.keys())}")

        hashtags_text = ""
        hashtags_value = None
        if add_hashtags:
            hashtags_value = self._generate_hashtags(prompt)
            hashtags_text = f"Include these hashtags: {hashtags_value}"

        cta_str = f"End with this call to action: {call_to_action}" if call_to_action else ""
        audience_str = audience or ""
        music_pref_str = music_preference or "No specific preference"
        music_lang_str = self._get_language_name(music_language) if music_language else "Any language"
        language_name = self._get_language_name(language)

        results = []

        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=[
                    "prompt", "tone", "words", "hashtags", "emojis", "extra_instructions",
                    "audience", "cta", "language", "post_type",
                    "music_preference", "music_language"
                ],
                template=self.templates[template]
            )

            # Compose inputs for the template
            inputs = {
                "prompt": prompt,
                "tone": tone,
                "words": words,
                "hashtags": hashtags_text,
                "emojis": "Add relevant emojis." if add_emojis else "",
                "extra_instructions": extra_instructions,
                "audience": audience_str,
                "cta": cta_str,
                "language": language_name,
                "post_type": post_type,
                "music_preference": music_pref_str,
                "music_language": music_lang_str,
            }

            # Chain prompt template to LLM and invoke
            chain = prompt_template | self.llm
            response = chain.invoke(inputs)

            generated_post = response.content.strip()

            if add_emojis:
                generated_post = self._add_emojis(generated_post)

            analysis = self._analyze_post(generated_post)

            results.append({
                "post": generated_post,
                "analysis": analysis,
                "tone": tone,
                "template": template,
                "hashtags": hashtags_value,
                "call_to_action": call_to_action,
                "audience": audience,
                "language": language_name,
                "post_type": post_type,
                "music_preference": music_pref_str,
                "music_language": music_lang_str
            })

        return results
