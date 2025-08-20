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
            "trendy": """
You are a professional social media strategist tasked with creating a trendy, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Trendy, modern, and culturally relevant for Instagram, using engaging and professional language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE trendy Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that feels current and connects strongly with the target audience.  
- Maintain a modern, stylish tone and wording style suited to the audience profile.  
- Keep the message fresh, relevant, and easy to relate to, without overusing slang or jargon.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final trendy Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! casual template
            "casual": """
You are a professional social media strategist tasked with creating a casual, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, friendly, and approachable for Instagram, using relaxed and natural language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE casual Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that feels relatable and easygoing for the target audience.  
- Maintain a conversational tone and wording style suited to the audience profile.  
- Keep the message simple, genuine, and relevant, without overloading technical or formal terms.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final casual Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! playful template
            "playful": """
You are a professional social media strategist tasked with creating a playful, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Playful, lively, and fun for Instagram, using energetic and lighthearted language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE playful Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that feels fun and entertaining for the target audience.  
- Maintain a cheerful, vibrant tone and wording style suited to the audience profile.  
- Keep the message creative, light, and enjoyable, avoiding heavy jargon or overly formal phrasing.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final playful Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! aesthetic template
            "aesthetic": """
You are a professional social media strategist tasked with creating an aesthetically refined, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Aesthetic, polished, and visually pleasing for Instagram, using respectful and professional language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE aesthetically styled Instagram {post_type} that aligns with the above details.  
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

Return ONLY the final aesthetically styled Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! funny template
            "funny": """
You are a professional social media strategist tasked with creating a funny, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Funny, witty, and entertaining for Instagram, using humor that feels natural and engaging

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE funny Instagram {post_type} that aligns with the above details.  
- Craft a clear, humorous post that makes the target audience smile or laugh while staying on-topic.  
- Maintain a witty, lighthearted tone and wording style suited to the audience profile.  
- Keep the humor clever and relatable, avoiding offensive jokes, sarcasm that may be misinterpreted, or overly niche references.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final funny Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! witty template
            "witty": """
You are a professional social media strategist tasked with creating a witty, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Witty, clever, and sharp for Instagram, using smart humor and engaging wordplay

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE witty Instagram {post_type} that aligns with the above details.  
- Craft a clever, engaging post that captures attention with intelligence and humor.  
- Maintain a sharp, stylish tone and wording style suited to the audience profile.  
- Keep the wit classy, concise, and relatable, avoiding forced jokes, niche references, or overly complex wordplay.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final witty Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! chill template
            "chill": """
You are a professional social media strategist tasked with creating a chill, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Chill, laid-back, and relaxed for Instagram, using calm and easygoing language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE chill Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that feels relaxed and effortless for the target audience.  
- Maintain a laid-back, smooth tone and wording style suited to the audience profile.  
- Keep the message simple, calm, and relatable, avoiding formal or overly energetic phrasing.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final chill Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! relatable template
            "relatable": """
You are a professional social media strategist tasked with creating a relatable, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Relatable, down-to-earth, and authentic for Instagram, using natural and approachable language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE relatable Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that makes the audience feel understood and connected.  
- Maintain an authentic, conversational tone and wording style suited to the audience profile.  
- Keep the message genuine, personal, and easy to identify with, avoiding over-polished or distant phrasing.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final relatable Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! inspiring template
            "inspiring": """
You are a professional social media strategist tasked with creating an inspiring, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Inspiring, motivational, and uplifting for Instagram, using empowering and positive language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE inspiring Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that motivates and encourages the target audience.  
- Maintain a positive, uplifting tone and wording style suited to the audience profile.  
- Keep the message empowering, authentic, and relatable, avoiding clichés or overly generic statements.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final inspiring Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! bold template
            "bold": """
You are a professional social media strategist tasked with creating a bold, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Bold, confident, and attention-grabbing for Instagram, using assertive and impactful language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE bold Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that stands out and makes a strong impression on the target audience.  
- Maintain a confident, striking tone and wording style suited to the audience profile.  
- Keep the message powerful, direct, and memorable, avoiding vague or overly cautious language.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final bold Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! minimal template
            "minimal": """
You are a professional social media strategist tasked with creating a minimal, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Minimal, clean, and simple for Instagram, using concise and uncluttered language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE minimal Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that is straightforward and visually or mentally uncluttered for the audience.  
- Maintain a clean, simple tone and wording style suited to the audience profile.  
- Keep the message concise, elegant, and easy to grasp, avoiding unnecessary words, jargon, or overcomplicated phrasing.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final minimal Instagram {post_type} content. No instructions, meta-text, or labels.
""",
#! emotional template
            "emotional": """
You are a professional social media strategist tasked with creating an emotional, high-quality Instagram {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Emotional, heartfelt, and moving for Instagram, using sincere and expressive language

Target Audience: {audience}  
Goal of the Post: {postgoal}  
Call to Action (CTA): {cta}  
{event_section}  
{music_section}  

{hashtags}  
{emojis}

Your task:  
- Write ONE emotional Instagram {post_type} that aligns with the above details.  
- Craft a clear, engaging post that resonates deeply and evokes feelings from the target audience.  
- Maintain a sincere, expressive tone and wording style suited to the audience profile.  
- Keep the message authentic, touching, and relatable, avoiding forced sentiment or over-dramatization.  

Do NOT:  
- Include any English if {language} is not English  
- Mention that the post is generated or prompted  
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences  
- Add headings, intro text, or commentary  
- Use markdown, labels, or instructions within the post  
- Overuse hashtags or emojis  

Return ONLY the final emotional Instagram {post_type} content. No instructions, meta-text, or labels.
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

# Author - UjjwalS - www.ujjwalsaini.dev
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
