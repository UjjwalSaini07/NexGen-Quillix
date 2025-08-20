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

        self.templates = {
            "storytelling": """
You are a professional social media strategist tasked with creating a high-quality, storytelling-focused Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, narrative-driven, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE compelling, story-driven Facebook post that aligns with the above details.
- Engage the audience through narrative techniques like anecdotes, scenarios, or relatable moments.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Ensure the story flows clearly and resonates with the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! professional template
            "professional": """
You are a professional social media strategist tasked with creating a high-quality Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Formal, engaging, and optimized for Facebook while maintaining professionalism and authority

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE clear, professional, and audience-focused Facebook {post_type} that aligns with the above details.
- Ensure the content maintains authority, professionalism, and engagement.
- Integrate any preferred music style naturally into the mood or tone.
- Make the message easy to follow and relevant to the target audience.
- Keep the content structured and suitable for Facebook.
- Avoid unnecessary jargon unless the audience is technical.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! question_prompt template
            "question_prompt": """
You are a professional social media strategist tasked with creating a high-quality, question-focused Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, question-driven Facebook {post_type} that aligns with the above details.
- Pose a clear, compelling question to encourage audience interaction and responses.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the question easy to understand and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! quote_based template
            "quote_based": """
You are a professional social media strategist tasked with creating a high-quality, quote-focused Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, quote-based Facebook {post_type} that aligns with the above details.
- Feature a compelling quote that resonates with the audience and encourages interaction.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the message easy to understand and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! announcement template
            "announcement": """
You are a professional social media strategist tasked with creating a high-quality, announcement-focused Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, announcement-style Facebook {post_type} that aligns with the above details.
- Present the announcement clearly and make it exciting for the audience.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the message easy to follow and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! poll_style template
            "poll_style": """
You are a professional social media strategist tasked with creating a high-quality, poll-style Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, poll-style Facebook {post_type} that aligns with the above details.
- Pose a clear and compelling poll question with options that encourage audience interaction.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the poll easy to understand and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! throwback template
            "throwback": """
You are a professional social media strategist tasked with creating a high-quality, throwback-style Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta} 

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, throwback-style Facebook {post_type} that aligns with the above details.
- Incorporate nostalgia, past memories, or previous events to resonate with the audience.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the message easy to follow and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! mini_blog template
            "mini_blog": """
You are a professional social media strategist tasked with creating a high-quality, mini-blog Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual, conversational, and optimized for Facebook engagement, structured like a short blog post

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE engaging, mini-blog-style Facebook {post_type} that aligns with the above details.
- Provide value, insights, or storytelling like a short blog within a single post.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the message easy to follow and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! concise template
            "concise": """
You are a professional social media strategist tasked with creating a high-quality, concise Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Short, clear, and optimized for Facebook engagement

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE concise and impactful Facebook {post_type} that aligns with the above details.
- Communicate the message clearly in as few words as possible.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content casual, relatable, and optimized for Facebook engagement.
- Make the message easy to understand and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
""",
#! technical template
            "technical": """
You are a professional social media strategist tasked with creating a high-quality, technical Facebook {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Detailed, informative, and optimized for Facebook engagement with a technical focus

Target Audience: {audience}  
Call to Action (CTA): {cta}  

{hashtags}  

{music_section}  
{emojis}  
Extra Instructions: {extra_instructions}

Your task:
- Write ONE technical Facebook {post_type} that aligns with the above details.
- Include precise, accurate, and informative content appropriate for a knowledgeable audience.
- Integrate any preferred music style naturally into the mood or tone.
- Keep the content clear, engaging, and optimized for Facebook engagement.
- Make the message easy to follow and relevant to the target audience.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, labels, or instructions within the post
- Overuse hashtags or emojis

Return ONLY the final Facebook {post_type} content. No instructions, meta-text, or labels.
"""
        }

# Author - UjjwalS - www.ujjwalsaini.dev
        self.tones = [
            "trendy", "casual", "playful", "aesthetic", "funny",
            "witty", "chill", "relatable", "inspiring", "bold", "minimal", "emotional"
        ]

    def _generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 15 relevant hashtags for a Facebook post about '{prompt}'. "
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

# Author - UjjwalS - www.ujjwalsaini.dev
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
        language_name = self._get_language_name(language)

        results = []

        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=[
                    "prompt", "tone", "words", "hashtags", "emojis", "extra_instructions",
                    "audience", "cta", "language", "post_type", "music_section"
                ],
                template=self.templates[template]
            )

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
                "music_section": ""
            }

            # Author: "Ujjwal Saini"
            chain = prompt_template | self.llm
            response = chain.invoke(inputs)
            generated_post = response.content.strip()

            if add_emojis:
                generated_post = self._add_emojis(generated_post)

            if add_music:
                song_prompt = (
                    f"Recommend exactly THREE specific, well-known songs in {music_language or 'any language'} "
                    f"that match the vibe '{music_preference or 'any style'}' for use as background music "
                    f"to the following Facebook post:\n\n{generated_post}\n\n"
                    "Return ONLY the song name and artist, one per line, nothing else."
                )
                song_result = self.llm.invoke(song_prompt)

                recommended_songs = [
                    song.strip() for song in song_result.content.strip().split("\n") if song.strip()
                ][:3]

                songs_formatted = "\n".join([f"🎵 Background Music: {song}" for song in recommended_songs])
                generated_post = f"{generated_post}\n\n{songs_formatted}"

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
                "music_preference": music_preference or "",
                "music_language": music_language or ""
            })

        return results
