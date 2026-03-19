"""
Enhanced Groq AI Service for NexGen-Quillix Automation Platform
AI-powered content generation and assistance using Groq LLM
"""
import os
import logging
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class GroqService:
    """AI service using Groq for content generation"""
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model_name = "llama-3.1-8b-instant"
        self.is_configured = bool(self.api_key)
        
        if self.is_configured:
            try:
                from langchain_groq import ChatGroq
                self.llm = ChatGroq(
                    groq_api_key=self.api_key,
                    model_name=self.model_name,
                    temperature=0.7
                )
                logger.info("Groq AI service initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Groq: {e}")
                self.llm = None
                self.is_configured = False
        else:
            logger.warning("Groq API key not configured")
            self.llm = None
    
    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.is_configured and self.llm is not None
    
    def generate_post(
        self,
        niche: str,
        tone: str = "professional",
        platform: Optional[str] = None,
        include_emoji: bool = True,
        include_cta: bool = True,
        include_hashtags: bool = True,
        length: str = "medium",
        word_count: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate a single social media post"""
        
        # Word count specification
        if word_count:
            word_count_spec = f"Generate EXACTLY {word_count} words. Count the words carefully to ensure exactly {word_count} words."
        else:
            word_count_spec = ""
        
        # Length specifications
        length_specs = {
            "short": "50-100 words",
            "medium": "100-200 words",
            "long": "200-300 words"
        }
        
        # Use word count if provided, otherwise use length
        final_length = f"{word_count} words" if word_count else length_specs.get(length, length_specs['medium'])
        
        # Emoji placeholder
        emoji_instruction = "Include relevant emojis throughout." if include_emoji else "No emojis."
        
        # CTA instruction
        cta_instruction = "Include a clear call-to-action at the end." if include_cta else "No call-to-action needed."
        
        # Hashtag instruction
        hashtag_instruction = "Include 5-10 relevant hashtags at the end." if include_hashtags else "No hashtags."
        
        # Main topic/prompt to focus on
        main_topic = niche.strip()
        
        prompt = f"""
Create ONE viral social media post about: "{main_topic}"

Tone: {tone}
{word_count_spec}
Length: {final_length}
{emoji_instruction}
{cta_instruction}
{hashtag_instruction}

CRITICAL REQUIREMENTS - FOLLOW THESE STRICTLY:
1. The post MUST be directly and ONLY about: "{main_topic}"
2. DO NOT deviate from "{main_topic}" - stay focused on this exact topic
3. Start with a powerful hook about {main_topic}
4. Every sentence must be relevant to {main_topic}
5. Be authentic and engaging
6. Match the specified tone: {tone}
7. Platform optimized: {platform if platform else 'general'}

IMPORTANT: 
- The post must be about "{main_topic}" only
- Do not include any unrelated information
- Generate exactly {word_count if word_count else 'the specified'} words
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                content = response.content
            except Exception as e:
                logger.error(f"AI generation error: {e}")
                content = self._fallback_content(niche, tone)
        else:
            content = self._fallback_content(niche, tone)
        
        return {"content": content}
    
    def _fallback_content(self, niche: str, tone: str) -> str:
        """Generate fallback content when AI is not available"""
        return f"Check out this amazing content about {niche}! #trending #{niche.replace(' ', '')}"
    
    def generate_reply(
        self,
        comment: str,
        tone: str = "friendly",
        platform: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a reply to a comment"""
        
        prompt = f"""
Reply to this comment with a {tone} tone:
Comment: "{comment}"

Requirements:
- Be engaging and personalized
- Add value to the conversation
- Keep it concise (1-2 sentences)
- Use appropriate emojis if relevant
- Don't be generic
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                reply = response.content
            except Exception as e:
                logger.error(f"Reply generation error: {e}")
                reply = "Thanks for your comment!"
        else:
            reply = "Thanks for your comment!"
        
        return {"reply": reply}
    
    def generate_hashtags(
        self,
        content: str,
        niche: str,
        count: int = 10
    ) -> Dict[str, Any]:
        """Generate relevant hashtags"""
        
        prompt = f"""
Generate {count} relevant hashtags for this content:
Niche: {niche}
Content: {content}

Return only hashtags, one per line, without the # symbol prefix.
Make them popular and relevant to the niche.
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                hashtags = [h.strip() for h in response.content.split('\n') if h.strip()]
            except Exception as e:
                logger.error(f"Hashtag generation error: {e}")
                hashtags = self._fallback_hashtags(niche)
        else:
            hashtags = self._fallback_hashtags(niche)
        
        return {"hashtags": hashtags}
    
    def _fallback_hashtags(self, niche: str) -> List[str]:
        """Generate fallback hashtags"""
        return [
            niche.replace(" ", "").lower(),
            f"#{niche.replace(' ', '').lower()}",
            "trending",
            "viral",
            "socialmedia"
        ][:5]
    
    def optimize_content(
        self,
        content: str,
        target_platform: str,
        improve_engagement: bool = True,
        shorten: bool = False
    ) -> Dict[str, Any]:
        """Optimize content for a specific platform"""
        
        # Platform-specific limits
        limits = {
            "twitter": 280,
            "x": 280,
            "instagram": 2200,
            "facebook": 63206,
            "linkedin": 3000,
            "youtube": 10000
        }
        
        max_length = limits.get(target_platform.lower(), 280)
        
        prompt = f"""
Optimize this content for {target_platform}:
Max length: {max_length} characters

Original content:
{content}

Tasks:
1. {"Make it more engaging and likely to get interactions" if improve_engagement else "Keep it informative"}
2. {"Shorten it to fit the platform limit" if shorten else "Adjust format for the platform"}
3. Add platform-specific formatting if needed

Return the optimized content.
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                optimized = response.content
            except Exception as e:
                logger.error(f"Content optimization error: {e}")
                optimized = content[:max_length]
        else:
            optimized = content[:max_length]
        
        suggestions = [
            "Use a compelling headline",
            "Include relevant emojis",
            "Add a call-to-action"
        ] if improve_engagement else []
        
        return {"content": optimized, "suggestions": suggestions}
    
    def generate_caption(
        self,
        description: Optional[str] = None,
        tone: str = "creative",
        platform: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate captions for images"""
        
        prompt = f"""
Generate 3 creative captions for this image.
Description: {description or 'No description provided'}
Tone: {tone}
Platform: {platform if platform else 'general'}

Return 3 unique captions, each on a separate line.
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                captions = [c.strip() for c in response.content.split('\n') if c.strip()]
            except Exception as e:
                logger.error(f"Caption generation error: {e}")
                captions = ["Amazing shot! 📸", "Love this! ❤️", "Incredible! ✨"]
        else:
            captions = ["Amazing shot! 📸", "Love this! ❤️", "Incredible! ✨"]
        
        return {"captions": captions}
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        
        prompt = f"""
Analyze the sentiment of this text:
"{text}"

Return your analysis in this format:
Sentiment: [positive/negative/neutral]
Score: [0-1, where 1 is most positive]
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                result = response.content
                
                # Parse result
                sentiment = "neutral"
                score = 0.5
                
                for line in result.split('\n'):
                    if "Sentiment:" in line:
                        sentiment = line.split(":")[1].strip().lower()
                    if "Score:" in line:
                        try:
                            score = float(line.split(":")[1].strip())
                        except:
                            pass
                
                return {"sentiment": sentiment, "score": score}
                
            except Exception as e:
                logger.error(f"Sentiment analysis error: {e}")
                return {"sentiment": "neutral", "score": 0.5}
        else:
            return {"sentiment": "neutral", "score": 0.5}
    
    def translate(self, text: str, target_language: str) -> Dict[str, Any]:
        """Translate content to another language"""
        
        prompt = f"""
Translate this text to {target_language}:
"{text}"

Provide only the translation, nothing else.
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                translation = response.content
            except Exception as e:
                logger.error(f"Translation error: {e}")
                translation = text
        else:
            translation = text
        
        return {"translation": translation}
    
    def generate_thread(self, topic: str, num_tweets: int = 5) -> Dict[str, Any]:
        """Generate a Twitter/X thread"""
        
        prompt = f"""
Create a {num_tweets}-tweet thread about: {topic}

Requirements:
- Each tweet should be engaging and build on the previous one
- Include a hook in the first tweet
- End with a call-to-action or summary
- Keep each tweet under 280 characters
- Add relevant hashtags

Format each tweet on a separate line.
"""
        
        if self.is_available():
            try:
                response = self.llm.invoke(prompt)
                tweets = [t.strip() for t in response.content.split('\n\n') if t.strip()]
            except Exception as e:
                logger.error(f"Thread generation error: {e}")
                tweets = [f"🧵 {topic} (1/{num_tweets})"]
        else:
            tweets = [f"🧵 {topic} (1/{num_tweets})"]
        
        return {"tweets": tweets}
