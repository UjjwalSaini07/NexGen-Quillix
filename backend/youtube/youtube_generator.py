import os
import re
from typing import List, Dict, Optional
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

class YouTubePostGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.llm = ChatGroq(
            model="gemma2-9b-it",
            api_key=api_key or os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
            temperature=0.7,
        )

        self.templates = {
            "default": """
You are an expert YouTube content writer tasked with creating a {post_type}.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Target Audience: {audience}  
📌 Call to Action (CTA): {cta}  
{hashtags}
{emojis}

Your task:
- Write in an engaging, platform-appropriate way to boost views, likes, and engagement.
- Adapt style to YouTube culture and the given tone.
- Avoid hashtags inside sentences and do not use markdown or headings.
- Do not mention that this is AI-generated.

Return ONLY the final text.
""",
#! professional template
            "professional": """
You are a professional social media strategist tasked with creating a high-quality YouTube {post_type} tailored for a specific audience.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Formal, engaging, and suitable for YouTube while maintaining professionalism and authority

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Create compelling, clear, and audience-focused content suitable for YouTube.
- Ensure it maintains authority and professionalism while being engaging for the platform.
- Make the message easy to follow and relevant to the audience.
- Avoid unnecessary jargon unless the audience is technical.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! technology template
            "technology": """
You are a tech-savvy social media strategist tasked with creating an engaging and informative YouTube {post_type} about technology.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Clear, insightful, and suitable for YouTube's tech audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Explain the technology topic in a way that is both accurate and easy to understand.
- Highlight key insights, innovations, or trends without overwhelming the audience with jargon.
- Maintain a sense of excitement and curiosity about technology.
- Use relatable examples or simple analogies to make complex ideas more accessible.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! lifestyle template
            "lifestyle": """
You are a creative social media strategist tasked with creating an inspiring and relatable YouTube {post_type} about lifestyle.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Warm, authentic, and visually appealing — perfect for YouTube's lifestyle audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Share lifestyle-related content that inspires, motivates, or entertains.
- Use a conversational style that feels genuine and relatable to viewers.
- Paint vivid pictures with words to help the audience visualize the experience.
- Encourage interaction by asking questions or inviting viewers to share their own experiences.
- Subtly incorporate tips, stories, or personal touches to strengthen connection.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! educational template
            "educational": """
You are an expert social media strategist tasked with creating a clear, engaging, and informative YouTube {post_type} for educational purposes.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Structured, easy-to-follow, and suitable for YouTube's learning-focused audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Present the topic in a way that is accurate, clear, and easy to understand.
- Break down complex ideas into digestible parts, using simple explanations or relatable analogies.
- Maintain an engaging flow so viewers stay interested while learning.
- Encourage curiosity and further exploration of the topic.
- Ensure the content feels authoritative but still approachable.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! entertainment template
            "entertainment": """
You are a creative social media strategist tasked with crafting a fun, captivating, and audience-grabbing YouTube {post_type} for the entertainment niche.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Energetic, engaging, and perfectly suited for YouTube's entertainment audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Make the content exciting, dynamic, and attention-grabbing from the very start.
- Use playful language, clever hooks, or surprising elements to keep viewers entertained.
- Incorporate storytelling, drama, or humor to make the experience memorable.
- Create a sense of anticipation so viewers stay engaged until the end.
- Encourage audience participation through comments, reactions, or sharing.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! inspirational template
            "inspirational": """
You are a creative social media strategist tasked with creating a powerful, uplifting, and motivational YouTube {post_type} for the inspirational niche.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Emotional, encouraging, and perfectly suited for YouTube's inspirational audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Deliver a message that inspires hope, confidence, or positive change.
- Use vivid and emotionally resonant language that speaks directly to the heart.
- Share short, impactful stories, quotes, or real-life examples that reinforce the message.
- Encourage self-reflection, action, and belief in personal potential.
- Keep the flow uplifting from start to finish, leaving viewers feeling motivated.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! behind the scenes template
            "behind the scenes": """
You are a creative social media strategist tasked with creating an authentic and engaging YouTube {post_type} that takes viewers behind the scenes.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Candid, immersive, and perfect for YouTube's behind-the-scenes audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Give viewers an exclusive, insider perspective they can’t get elsewhere.
- Share authentic moments, real processes, or personal experiences.
- Make the audience feel like they are part of the journey, not just watching it.
- Highlight details, challenges, or fun moments that happen off-camera.
- Build a sense of closeness and connection with the audience through honesty and relatability.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! tutorial template
            "tutorial": """
You are an expert social media strategist tasked with creating a clear, practical, and easy-to-follow YouTube {post_type} in the tutorial niche.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Step-by-step, instructional, and perfectly suited for YouTube's tutorial audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Guide the audience through the process in a logical, easy-to-follow sequence.
- Use simple, direct language that makes learning stress-free and approachable.
- Provide clear instructions with examples, tips, or common mistakes to avoid.
- Keep the pace engaging without skipping essential details.
- Ensure the viewer feels confident they can replicate the process by the end.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! review template
            "review": """
You are a skilled social media strategist tasked with creating an honest, engaging, and well-structured YouTube {post_type} in the review niche.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Informative, balanced, and perfectly suited for YouTube's review audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Provide a clear and detailed evaluation of the subject, highlighting both strengths and weaknesses.
- Use a tone that is honest, credible, and respectful, avoiding unnecessary hype.
- Share specific examples or experiences to back up your opinions.
- Help the audience make an informed decision by summarizing key takeaways.
- Keep the content engaging so viewers stay interested until the end.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
""",
#! news updates template
            "news updates": """
You are a professional social media strategist tasked with creating clear, concise, and engaging YouTube {post_type} covering news and updates.

📌 Topic: {prompt}  
📌 Language: {language} (write entirely in {language})  
📌 Tone: {tone}  
📌 Length: Around {words} words  
📌 Style: Informative, objective, and suited for YouTube's news audience

Target Audience: {audience}  
Call to Action (CTA): {cta}  
{hashtags}  
{emojis}

Your task:
- Present the latest news or updates accurately and succinctly.
- Maintain neutrality and credibility, avoiding bias or speculation.
- Highlight the most important facts and developments clearly.
- Keep the delivery engaging to hold viewer attention.
- Encourage viewers to stay informed and engaged with the topic.

Do NOT:
- Include any English (if language is not English)
- Mention that this is a generated or prompted post
- Use markdown, bullet points, or emojis in the middle of sentences
- Add headings, intro text, or comments
- Overuse hashtags

Return ONLY the final YouTube {post_type} content. No instructions, meta-text, or labels.
"""
        }
# Author - UjjwalS - www.ujjwalsaini.dev
        self.tones = [
            "professional",
            "friendly",
            "sarcastic",
            "bold",
            "funny",
            "relatable",
            "inspiring",
            "thought-provoking",
            "controversial",
            "motivational",
            "direct",
        ]

    def generate_hashtags(self, prompt: str) -> str:
        hashtag_prompt = (
            f"Generate 20 relevant and currently trending YouTube hashtags for a post about '{prompt}'. "
            "Return ONLY the hashtags, separated by spaces. Do not include punctuation, explanations, or comments."
        )
        hashtags = self.llm.invoke(hashtag_prompt)
        return hashtags.content.strip()

    def add_emojis(self, text: str) -> str:
        emoji_prompt = (
            f"Enhance the following YouTube post with relevant emojis:\n\n{text}\n\n"
            "Return ONLY the updated post."
        )
        result = self.llm.invoke(emoji_prompt)
        return result.content.strip()

    def analyze_post(self, post: str) -> Dict:
        return {
            "word_count": len(re.findall(r"\w+", post)),
            "char_count": len(post),
            "sentence_count": len(re.findall(r"[.!?]+", post)),
        }

    def get_language_name(self, code: str) -> str:
        mapping = {
            "en": "English", "hi": "Hindi", "es": "Spanish", "fr": "French",
            "de": "German", "zh": "Chinese", "ja": "Japanese", "ar": "Arabic",
            "pt": "Portuguese", "ru": "Russian",
        }
        return mapping.get(code, "English")

    def generate_post(
        self,
        prompt: str,
        words: int = 80,
        tone: str = "friendly",
        template: str = "default",
        postTypeOptions: str = "Video Description",
        add_hashtags: bool = True,
        add_emojis: bool = False,
        variations: int = 3,
        call_to_action: Optional[str] = None,
        audience: Optional[str] = None,
        language: str = "en",
    ) -> List[Dict]:
        # Basic validations
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")
        if not (1 <= variations <= 6):
            raise ValueError("Variations must be between 1 and 6.")
        if tone.lower() not in self.tones:
            raise ValueError(f"Invalid tone. Available: {', '.join(self.tones)}")
        if template.lower() not in self.templates:
            raise ValueError(f"Invalid template. Available: {', '.join(self.templates.keys())}")

        self.tone = tone.lower()
        self.template = template.lower()

        hashtags = ""
        hashtags_str = ""
        if add_hashtags:
            hashtags = self.generate_hashtags(prompt)
            hashtags_str = f"Include these hashtags: {hashtags}" 

        cta_str = f"End with this call to action: {call_to_action}" if call_to_action else ""
        audience_str = f"Target audience: {audience}" if audience else ""
        language_name = self.get_language_name(language)

        template_to_use = self.templates.get(self.tone, self.templates["default"])

        results = []
        for _ in range(variations):
            prompt_template = PromptTemplate(
                input_variables=["prompt", "tone", "words", "hashtags", "emojis", "audience", "cta", "language", "post_type"],
                template=template_to_use,
            )
            chain = prompt_template | self.llm

            response = chain.invoke({
                "prompt": prompt,
                "tone": self.tone,
                "words": words,
                "hashtags": hashtags_str,
                "emojis": "Add relevant emojis." if add_emojis else "",
                "audience": audience_str,
                "cta": cta_str,
                "language": language_name,
                "post_type": postTypeOptions,
            })
            generated_post = response.content.strip()

            if add_emojis:
                generated_post = self.add_emojis(generated_post)

            analysis = self.analyze_post(generated_post)

            results.append({
                "post": generated_post,
                "analysis": analysis,
                "tone": self.tone,
                "template": self.template,
                "category": postTypeOptions,
                "hashtags": hashtags if add_hashtags else None,
                "call_to_action": call_to_action,
                "audience": audience,
                "language": language_name
            })

        return results
