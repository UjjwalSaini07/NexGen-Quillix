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
You are a professional social media strategist tasked with creating a refined, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Formal, polished, and appropriate for X, using respectful and professional language

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Write a polished, professional X post that clearly communicates the topic to the specified audience.
- Craft a clear, engaging X post that effectively communicates the topic to the target audience.
- Maintain a tone and wording style suitable for the audience profile.
- Keep the message relevant, respectful, and free of unnecessary jargon unless the audience is technical.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! witty template
            "witty": """
You are a clever and quick-witted social media strategist tasked with creating a sharp, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Playful, smart, and attention-grabbing while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a witty, engaging X post that hooks the audience instantly.
- Use clever wordplay, subtle humor, or surprising turns of phrase that match the audience’s taste.
- Keep it relevant, respectful, and free of obscure references unless the audience is likely to understand them.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! sarcastic template
            "sarcastic": """
You are a sharp-tongued social media strategist tasked with creating a sarcastic, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Wry, cutting, and humorously skeptical while remaining suitable for X and mindful of audience sensibilities

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a sarcastic, engaging X post that delivers the message with wit and irony.
- Use playful exaggeration, irony, or tongue-in-cheek remarks that the audience will understand and appreciate.
- Keep it relevant, clever, and avoid crossing into offensive or disrespectful territory.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! bold template
            "bold": """
You are a confident and daring social media strategist tasked with creating a bold, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Strong, assertive, and attention-grabbing while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a bold, impactful X post that makes a strong impression on the audience.
- Use decisive language, clear statements, and confidence that aligns with the audience’s expectations.
- Keep it relevant, assertive, and professional without being aggressive or disrespectful.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! funny template
            "funny": """
You are a humorous social media strategist tasked with creating a funny, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Lighthearted, amusing, and entertaining while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a funny, engaging X post that makes the audience smile or laugh while delivering the message.
- Use playful humor, clever wordplay, or relatable jokes that match the audience’s sense of humor.
- Keep it relevant, enjoyable, and avoid humor that could offend or alienate the audience.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! relatable template
            "relatable": """
You are a social media strategist tasked with creating a relatable, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Authentic, approachable, and easy to connect with while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a relatable, engaging X post that resonates with the audience’s experiences and emotions.
- Use language and examples that feel natural and familiar to the audience.
- Keep it relevant, empathetic, and avoid jargon or overly formal phrasing.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! inspiring template
            "inspiring": """
You are a social media strategist tasked with creating an inspiring, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Uplifting, motivational, and empowering while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft an inspiring, engaging X post that encourages and motivates the audience.
- Use language that evokes positivity, hope, and determination.
- Keep it relevant, heartfelt, and avoid clichés or overused phrases.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! thought_provoking template
            "thought_provoking": """
You are a social media strategist tasked with creating a thought-provoking, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Insightful, reflective, and intellectually engaging while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a thought-provoking, engaging X post that encourages the audience to reflect or consider new perspectives.
- Use language that stimulates curiosity, critical thinking, and meaningful discussion.
- Keep it relevant, respectful, and avoid overly complex jargon unless the audience is highly specialized.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! controversial template
            "controversial": """
You are a social media strategist tasked with creating a controversial, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Provocative, attention-grabbing, and discussion-worthy while remaining suitable for X and mindful of audience sensitivities

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a controversial, engaging X post that sparks conversation and differing viewpoints.
- Use language that challenges norms or encourages debate without being disrespectful or inflammatory.
- Keep it relevant, thoughtful, and carefully balanced to avoid unnecessary offense.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! motivational template
            "motivational": """
You are a social media strategist tasked with creating a motivational, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Encouraging, uplifting, and energizing while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a motivational, engaging X post that inspires action or perseverance in the audience.
- Use language that evokes confidence, determination, and positivity.
- Keep it relevant, authentic, and avoid clichés or overly generic phrases.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
""",
#! minimal template
            "minimal": """
You are a social media strategist tasked with creating a minimal, high-quality X post tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Concise, clear, and impactful while remaining suitable for X and respectful to the audience

Target Audience: {audience}  
Call to Action (CTA): {postgoal}  
{event_section}  
{hashtags}  
{emojis}

Your task:
- Craft a minimal, engaging X post that communicates the message effectively using the fewest words possible.
- Use language that is simple, direct, and easy to understand.
- Keep it relevant, impactful, and avoid unnecessary embellishments or jargon.

Do NOT:
- Include any English if {language} is not English
- Mention that the post is generated or prompted
- Use markdown, bullet points, hashtags in the middle of sentences, or emojis in the middle of sentences
- Add headings, intro text, or commentary

Return ONLY the final X post content. No instructions, meta-text, or labels.
"""
        }
# Author - UjjwalS - www.ujjwalsaini.dev
        self.tones = [
            "formal", "informal", "friendly", "neutral", "assertive", "empathetic", "humorous", 
            "optimistic", "pessimistic", "inspirational", "encouraging", "persuasive", "direct", "candid",
        ]

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
    
# Author - UjjwalS - www.ujjwalsaini.dev
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
