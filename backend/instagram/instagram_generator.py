import re
import os
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from typing import List, Dict, Optional

class InstagramPostGenerator:
    def __init__(self, api_key: str = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
            temperature=0.7,
        )

        self.templates = {
            "aesthetic": """
You are a professional social media strategist tasked with creating an aesthetically refined, high-quality Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Aesthetic, polished, and visually pleasing for Facebook, using respectful and professional language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE aesthetically styled Facebook {post_type} that aligns with the above details.  
- Craft a clear, engaging post that communicates the topic beautifully to the target audience.  
- Maintain an elegant tone, wording style, and structure suited to the audience profile.  
- Keep the message visually pleasing, relevant, and free of unnecessary jargon unless the audience is technical.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final aesthetically styled Facebook {post_type} content. No instructions, meta-text, or labels.
"""
        }

        self.tones = [
            "positive", "motivational", "romantic", "sarcastic", "humorous", "uplifting", "confident", "friendly", "empowering", "sincere", 
            "adventurous", "grateful", "cheerful", "reflective", "edgy", "passionate", "optimistic", "dramatic", "supportive", "lighthearted"
        ]

    # Author: "Ujjwal Saini"
    def generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 10 relevant and currently trending Instagram hashtags for a post about '{prompt}'. "
            "Return ONLY the hashtags, separated by spaces. Do not include punctuation, explanations, or comments."
        )
        hashtags = self.llm.invoke(hashtag_prompt)
        return hashtags.content.strip()

    def add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Enhance the following Instagram post by adding relevant and appropriate emojis to increase engagement:\n\n{text}\n\n"
            "Return ONLY the revised post with emojis added. Do not include any explanations or extra text."
        )
        result = self.llm.invoke(emoji_prompt)
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
        tone: str = "humorous",
        template: str = "aesthetic",
        add_hashtags: bool = False,
        add_emojis: bool = False,
        add_music: bool = False,
        add_event: bool = False,
        variations: int = 1,
        post_type: Optional[str] = None,
        postgoal: Optional[str] = None,
        call_to_action: Optional[str] = None,
        eventDetails: Optional[str] = None,
        audience: Optional[str] = None,
        language: str = "en",
        music_preference: Optional[str] = None,
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
        cta_str = f"End with this call to action: {call_to_action}" if call_to_action else ""
        audience_str = audience or "General audience"
        language_name = self.get_language_name(language)
        event_section = f"Event Details: {eventDetails}" if add_event and eventDetails else ""

        results = []
        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=[
                    "prompt", "tone", "words", "hashtags", "emojis", "audience",
                    "post_type", "postgoal", "cta", "event_section", "language", "music_section"
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
                "post_type": post_type or "",
                "postgoal": postgoal or "",
                "cta": cta_str,
                "event_section": event_section,
                "language": language_name,
                "music_section": "",
            })

            generated_post = response.content.strip()
            # Author: "Ujjwal Saini"

            if add_emojis:
                generated_post = self.add_emojis(generated_post)
            
            if add_music:
                song_prompt = (
                    f"Recommend exactly THREE specific, well-known songs in {music_preference or 'any language'} "
                    f"that match the vibe 'any style' for use as background music "
                    f"to the following Instagram post:\n\n{generated_post}\n\n"
                    "Return ONLY the song name and artist, one per line, nothing else."
                )
                song_result = self.llm.invoke(song_prompt)

                recommended_songs = [
                    song.strip() for song in song_result.content.strip().split("\n") if song.strip()
                ][:3]

                songs_formatted = "\n".join([f"🎵 Background Music: {song}" for song in recommended_songs])
                generated_post = f"{generated_post}\n\n{songs_formatted}"

            analysis = self.analyze_post(generated_post)

            results.append({
                "post": generated_post,
                "analysis": analysis,
                "tone": tone,
                "template": template,
                "hashtags": hashtags_str if add_hashtags else None,
                "call_to_action": call_to_action,
                "post_type": post_type,
                "postgoal": postgoal,
                "eventDetails": eventDetails if add_event else None,
                "audience": audience,
                "language": language_name,
                "music_preference": music_preference or "",
            })
        return results
