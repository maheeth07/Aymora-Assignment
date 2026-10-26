import json
import logging
import os
from datetime import datetime, timezone
from typing import List, Optional

from groq import Groq
from backend.schemas.chat import (
    SuggestionRequest,
    SuggestionResponse,
    SuggestionTones,
)
from backend.schemas.profile import Profile
from backend.services.repository import InMemoryRepository, get_repository

logger = logging.getLogger("groq_service")


class GroqService:
    """
    AI Conversation Companion Service for Aymora Spark.
    
    Responsibilities:
    1. Generates 3 contextual conversational sparks (Funny, Flirty, Sweet).
    2. Tailors drafts to shared interests, candidate bio, and recent chat history.
    3. Uses Groq LLM API with structured JSON output and configurable models.
    4. Enforces safety: strictly forbids manipulative, coercive, explicit, or deceptive text.
    5. Bulletproof Fallback: Returns rich, contextual suggestions when Groq is unconfigured or unavailable.
    """

    def __init__(self, repository: Optional[InMemoryRepository] = None):
        self.repository = repository or get_repository()
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.timeout = float(os.getenv("GROQ_TIMEOUT_SECONDS", "8.0"))

    def _get_client(self) -> Optional[Groq]:
        if not self.api_key:
            return None
        try:
            return Groq(api_key=self.api_key, timeout=self.timeout)
        except Exception as e:
            logger.warning(f"Failed to instantiate Groq client: {e}")
            return None

    def _generate_fallback(
        self,
        partner: Profile,
        shared_interests: List[str],
        recent_messages: List[str],
    ) -> SuggestionTones:
        """
        Deterministic, high-empathy fallback suggestions based on partner persona & shared interests.
        Ensures the UI never fails even if offline, unauthenticated, or rate-limited.
        """
        primary_interest = shared_interests[0] if shared_interests else (partner.interests[0] if partner.interests else None)

        if primary_interest == "Specialty Coffee":
            return SuggestionTones(
                funny="Serious question: is pour-over genuinely a mindful ritual, or just an excuse to stare at boiling water for five minutes?",
                flirty="I have a theory that your taste in coffee is impeccable. Want to put that to the test at a local roaster this week?",
                sweet=f"Hi {partner.name}, I love that you're into specialty coffee. What's the most memorable café or brew you've discovered recently?",
            )
        elif primary_interest in ["Ceramics", "Contemporary Art", "Thrifting & Vintage"]:
            return SuggestionTones(
                funny="My spatial awareness is 10% elegance and 90% bumping into studio display tables. How steady are your hands?",
                flirty=f"Your eye for texture and aesthetics is captivating, {partner.name}. I'd love to wander through a gallery or studio with you sometime.",
                sweet=f"There's something so grounding about {primary_interest.lower()}. What drew you into creating and appreciating tactile art?",
            )
        elif primary_interest in ["Analog Photography", "Indie Cinema"]:
            return SuggestionTones(
                funny="Confession: half my photo rolls are slightly out of focus, but I aggressively claim it's 'cinematic mood'.",
                flirty=f"A fellow film enthusiast! I feel like any movie recommendation from you comes with a deep conversation afterward, {partner.name}.",
                sweet=f"What's one film or frame that has stuck with you long after the credits rolled?",
            )
        elif primary_interest in ["Bouldering", "Hiking & Trail Running", "Cycling"]:
            return SuggestionTones(
                funny="I will enthusiastically join any outdoor route, provided there is a guaranteed pastry or taco reward at the summit.",
                flirty=f"You bring such grounded energy, {partner.name}. Let's see if you can out-pace me on a weekend trail or climbing problem.",
                sweet=f"Being outdoors has such a calming reset effect. What's your favorite pocket of nature to decompress in?",
            )
        elif primary_interest in ["Modern Architecture", "Urban Gardening"]:
            return SuggestionTones(
                funny="I rate buildings and parks purely by how good a reading nook they provide. How strict are your architectural criteria?",
                flirty=f"You design spaces that feel alive, {partner.name}. It makes me curious what kind of places inspire your favorite ideas.",
                sweet=f"I really admire how intentional you are about {primary_interest.lower()}. What project are you most proud of shaping?",
            )
        else:
            return SuggestionTones(
                funny=f"I was going to open with a smooth icebreaker, but your bio actually made me pause and smile, {partner.name}.",
                flirty=f"Hi {partner.name}, your energy is so refreshing. I have a feeling conversation with you flows effortlessly.",
                sweet=f"Hi {partner.name}, I really enjoyed reading your bio. What's been the highlight of your week so far?",
            )

    def generate_suggestions(self, request: SuggestionRequest) -> SuggestionResponse:
        """
        Orchestrates suggestion generation via Groq LLM with safety constraints,
        strict JSON validation, and automatic fallback.
        """
        partner = self.repository.get_profile(request.partner_id)
        if not partner:
            # Fallback mock partner for graceful response
            partner = Profile(
                id=request.partner_id,
                name="Connection",
                age=27,
                bio="Creative explorer",
                avatar="",
                interests=["Art", "Coffee"],
            )

        current_user = self.repository.get_profile(request.current_user_id or "user-00")
        current_user_interests = current_user.interests if current_user else []

        # Compute shared interests
        p_interests_norm = {i.lower(): i for i in partner.interests}
        shared_interests = [
            p_interests_norm[i.lower()]
            for i in current_user_interests
            if i.lower() in p_interests_norm
        ]

        now_iso = datetime.now(timezone.utc).isoformat()
        client = self._get_client()

        # If Groq client is not available, return contextual fallback immediately
        if not client:
            tones = self._generate_fallback(partner, shared_interests, request.recent_messages or [])
            return SuggestionResponse(
                suggestions=tones,
                source="contextual_fallback",
                model="local-rule-engine",
                partner_name=partner.name,
                shared_interests=shared_interests,
                generated_at=now_iso,
            )

        # Build constrained, safety-first prompt
        system_prompt = (
            "You are Aymora Spark's AI Conversation Companion. "
            "Your task is to craft 3 natural, charming conversational openers or replies for a thoughtful dating app. "
            "Strict Guidelines:\n"
            "- Tone 1 (funny): Witty, self-deprecating, playful, or clever observation. Not cheesy, sarcastic, or crude.\n"
            "- Tone 2 (flirty): Subtle, warm, complimentary, with a gentle spark of interest. Never sexually explicit, creepy, or forward.\n"
            "- Tone 3 (sweet): Sincere, inquisitive, empathetic, focusing on shared values or creative life.\n"
            "- DO NOT be manipulative, deceptive, coercive, or generic.\n"
            "- Keep each suggestion concise (1 to 2 sentences max).\n"
            "- You must return valid JSON in this exact structure:\n"
            '{\n  "funny": "string",\n  "flirty": "string",\n  "sweet": "string"\n}'
        )

        user_content = {
            "partner_name": partner.name,
            "partner_occupation": partner.occupation,
            "partner_bio": partner.bio,
            "partner_interests": partner.interests,
            "shared_interests": shared_interests,
            "recent_messages": (request.recent_messages or [])[-3:],
            "context_note": request.context_note,
        }

        try:
            chat_completion = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Generate 3 conversation suggestions for this match context:\n{json.dumps(user_content)}",
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=300,
            )

            raw_text = chat_completion.choices[0].message.content or "{}"
            parsed_data = json.loads(raw_text)

            tones = SuggestionTones(
                funny=parsed_data.get("funny", "").strip() or self._generate_fallback(partner, shared_interests, []).funny,
                flirty=parsed_data.get("flirty", "").strip() or self._generate_fallback(partner, shared_interests, []).flirty,
                sweet=parsed_data.get("sweet", "").strip() or self._generate_fallback(partner, shared_interests, []).sweet,
            )

            return SuggestionResponse(
                suggestions=tones,
                source="groq_llm",
                model=self.model,
                partner_name=partner.name,
                shared_interests=shared_interests,
                generated_at=now_iso,
            )

        except Exception as e:
            logger.warning(f"Groq API call encountered an error or timeout ({e}). Engaging contextual fallback.")
            tones = self._generate_fallback(partner, shared_interests, request.recent_messages or [])
            return SuggestionResponse(
                suggestions=tones,
                source="contextual_fallback",
                model=f"fallback-on-error ({type(e).__name__})",
                partner_name=partner.name,
                shared_interests=shared_interests,
                generated_at=now_iso,
            )
