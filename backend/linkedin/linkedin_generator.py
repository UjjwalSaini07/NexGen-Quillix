from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from typing import List, Dict, Optional
import re
import os
# import json

class LinkedInPostGenerator:
    def __init__(self, api_key: str = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
            temperature=0.7,
        )

        self.templates = {
            "professional": """
You are a professional social media strategist tasked with writing a high-quality LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Formal and suitable for LinkedIn with polished and respectful language

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a polished, professional LinkedIn post that clearly communicates the topic to the specified audience.
- Use a tone and wording style appropriate for that audience.
- Ensure the message is relevant, respectful, and avoids jargon unless the audience is technical.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! casual template
            "casual": """
You are a creative social media writer tasked with crafting a casual, engaging LinkedIn post.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Casual and suitable for LinkedIn with a relaxed, conversational style

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}
Your task:
- Write a relaxed, relatable LinkedIn post that clearly communicates the topic.
- Use a tone and wording that feels authentic, conversational, and easy to connect with.
- Follow the style specified (e.g., humorous, reflective, witty, storytelling).
- Avoid being overly formal or robotic.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Strictly output ONLY the final LinkedIn post content. No instructions, labels, or extra text.
""",
#! informative template
            "informative": """
You are an insightful content creator tasked with writing an informative LinkedIn post for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Informative and suitable for LinkedIn ensure the post is clear, factual, and educational

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a well-structured LinkedIn post that delivers value through facts, insights, or useful frameworks.
- Use a tone and language appropriate for explaining or breaking down the topic in a clear and accessible way.
- Follow the specified style (e.g., guide-style, data-driven, how-to, analytical).
- Ensure the post remains respectful, relevant, and not overly casual or promotional.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Strictly output ONLY the final LinkedIn post content. No instructions, labels, or extra text.
""",
#! motivational template
            "motivational": """
You are a thoughtful content creator tasked with writing a motivational LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Motivational and suitable for LinkedIn with an uplifting and empowering tone

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write an inspiring and authentic LinkedIn post that encourages reflection, action, or positivity.
- Use a tone that evokes emotion, confidence, and energy without being exaggerated or cliché.
- Ensure the message is genuine, respectful, and tailored to the audience's aspirations.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! witty template
            "witty": """
You are a creative social media strategist tasked with writing a witty and clever LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Witty and suitable for LinkedIn with clever, engaging, and light-hearted language

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a sharp, clever LinkedIn post that entertains while communicating the topic clearly.
- Use a tone that balances humor with professionalism appropriate for LinkedIn.
- Ensure the message is engaging, respectful, and tailored to the audience’s preferences.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! inspirational template
            "inspirational": """
You are a thoughtful content creator tasked with writing an inspirational LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Inspirational and suitable for LinkedIn with a hopeful, uplifting, and motivating tone

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write an uplifting and motivating LinkedIn post that encourages reflection and positivity.
- Use a tone that inspires confidence and optimism while remaining professional.
- Ensure the message is genuine, respectful, and resonates with the audience’s aspirations.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! direct template
            "direct": """
You are a straightforward social media strategist tasked with writing a direct, no-fluff LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Direct and suitable for LinkedIn with clear, concise, and no-fluff messaging

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a clear and to-the-point LinkedIn post that communicates the topic without unnecessary details.
- Use a tone that is assertive yet professional, suitable for LinkedIn.
- Ensure the message is relevant, respectful, and tailored to the audience’s expectations.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! narrative template
            "narrative": """
You are a skilled storyteller tasked with writing a story-style narrative LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Narrative and suitable for LinkedIn with a compelling, engaging story format

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a LinkedIn post that tells a clear and engaging story related to the topic.
- Use a tone that draws readers in and makes the message memorable while maintaining professionalism.
- Ensure the story is relevant, respectful, and resonates with the audience’s interests.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! concise template
            "concise": """
You are a precise social media strategist tasked with writing a concise, short LinkedIn post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Concise and suitable for LinkedIn with clear, brief, and impactful messaging

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a LinkedIn post that communicates the topic clearly and succinctly.
- Use a tone that is straightforward yet engaging, fitting the LinkedIn professional environment.
- Ensure the message is relevant, respectful, and tailored to the audience’s expectations.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
""",
#! technical template
            "technical": """
You are an expert social media strategist tasked with writing a technical LinkedIn post with industry insights tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Technical and suitable for LinkedIn with detailed industry insights and precise terminology

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write a LinkedIn post that delivers deep technical insights relevant to the industry.
- Use a tone that is knowledgeable, clear, and professional, fitting for a technical audience.
- Ensure the message is accurate, respectful, and tailored to the audience’s expertise.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis
- Add headings, intro text, or comments

Return ONLY the final LinkedIn post content. No instructions, meta-text, or labels.
"""
        }

        self.tones = [
            "formal",
            "conversational",
            "clear",
            "clever",
            "warm",
            "expert",
            "storytelling",
            "assertive",
            "energetic",
            "confident",
            "encouraging",
            "hopeful",
            "direct",
            "friendly",
            "motivational"
        ]
    # Author: "Ujjwal Saini"
    def generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 25 relevant and currently trending LinkedIn hashtags for a post about '{prompt}'. "
            "Return ONLY the hashtags, separated by spaces. Do not include punctuation, explanations, or comments."
        )
        hashtags = self.llm.invoke(hashtag_prompt)
        return hashtags.content.strip()

    def add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Enhance the following LinkedIn post by adding relevant and appropriate emojis to increase engagement:\n\n{text}\n\n"
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
            "en": "English",
            "fr": "French",
            "hi": "Hindi",
            "es": "Spanish",
            "de": "German",
            "zh": "Chinese",
            "ja": "Japanese",
            "ar": "Arabic",
            "pt": "Portuguese",
            "ru": "Russian",
        }
        return mapping.get(code, "English")

    def generate_post(
        self,
        prompt: str,
        words: int = 200,
        tone: str = "formal",
        template: str = "professional",
        add_hashtags: bool = False,
        add_emojis: bool = False,
        variations: int = 1,
        call_to_action: Optional[str] = None,
        audience: Optional[str] = None,
        language: str = "en",
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

        cta_str = f"End with this call to action: {call_to_action}" if call_to_action else ""
        audience_str = f"Target audience: {audience}" if audience else ""

        language_name = self.get_language_name(language)

        results = []
        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=["prompt", "tone", "words", "hashtags", "emojis", "audience", "cta", "language_name" ],
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
                    "audience": audience_str,
                    "cta": cta_str,
                    "language": language_name,
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
                "call_to_action": call_to_action,
                "audience": audience,
                "language": language_name
            })

            # print("Received language from frontend:", language)
            # print("\nFinal JSON Response (each variation):")
            # print(json.dumps(results, indent=2, ensure_ascii=False))
        return results
