import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

from backend.schemas.profile import Profile
from backend.schemas.game import QuestionItem
from backend.schemas.conversation import Conversation, ChatMessage


class InMemoryRepository:
    """
    Decoupled In-Memory Repository for Aymora Spark.
    
    This layer isolates all data access from business logic, ensuring straightforward
    migration to MongoDB or PostgreSQL without rewriting services or API endpoints.
    """

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            data_dir = Path(__file__).resolve().parent.parent / "data"
        self.data_dir = data_dir
        
        self._profiles: Dict[str, Profile] = {}
        self._questions: List[QuestionItem] = []
        
        # Private interest registry: directional set of (from_user_id, to_user_id)
        self._interests: Set[Tuple[str, str]] = set()
        
        # Established mutual connections: {connection_id: {user_a, user_b, created_at, conv_id}}
        self._connections: Dict[str, dict] = {}
        
        # Conversations: {conv_id: Conversation}
        self._conversations: Dict[str, Conversation] = {}
        
        self._load_seed_data()
        self._seed_initial_state()

    def _load_seed_data(self) -> None:
        profiles_path = self.data_dir / "sample_profiles.json"
        if profiles_path.exists():
            with open(profiles_path, "r", encoding="utf-8") as f:
                raw_profiles = json.load(f)
                for item in raw_profiles:
                    profile = Profile(**item)
                    self._profiles[profile.id] = profile

        questions_path = self.data_dir / "sample_questions.json"
        if questions_path.exists():
            with open(questions_path, "r", encoding="utf-8") as f:
                raw_questions = json.load(f)
                self._questions = [QuestionItem(**q) for q in raw_questions]

    def _seed_initial_state(self) -> None:
        """
        Seeds initial demo state so the prototype can be experienced immediately:
        1. Julian (user-01) has expressed interest in Maya (user-00) privately.
           When Maya expresses interest in Julian, it triggers a mutual match!
        2. Elena (user-02) and Maya (user-00) already have a mutual connection and active thread.
        """
        # Seed Julian -> Maya interest
        self._interests.add(("user-01", "user-00"))
        
        # Seed mutual connection between Elena (user-02) and Maya (user-00)
        self._interests.add(("user-00", "user-02"))
        self._interests.add(("user-02", "user-00"))
        
        conn_id = "conn-demo-elena-maya"
        conv_id = "conv-elena-maya"
        
        now_iso = datetime.now(timezone.utc).isoformat()
        self._connections[conn_id] = {
            "id": conn_id,
            "user_a_id": "user-00",
            "user_b_id": "user-02",
            "created_at": now_iso,
            "conversation_id": conv_id,
        }
        
        elena_profile = self._profiles.get("user-02")
        if elena_profile:
            self._conversations[conv_id] = Conversation(
                id=conv_id,
                participant_ids=["user-00", "user-02"],
                partner=elena_profile,
                created_at=now_iso,
                last_active=now_iso,
                messages=[
                    ChatMessage(
                        id="msg-01",
                        sender_id="user-02",
                        text="Hi Maya! I loved your note on sustainable daylighting. Which 35mm stock do you usually load for street walks?",
                        timestamp=now_iso,
                        is_ai_assisted=False
                    )
                ]
            )

    # --- Profile Operations ---
    def get_profile(self, profile_id: str) -> Optional[Profile]:
        return self._profiles.get(profile_id)

    def get_current_user(self) -> Optional[Profile]:
        for profile in self._profiles.values():
            if profile.is_current_user:
                return profile
        return self._profiles.get("user-00")

    def list_all_profiles(self) -> List[Profile]:
        return list(self._profiles.values())

    # --- Questions Operations ---
    def list_all_questions(self) -> List[QuestionItem]:
        return list(self._questions)

    # --- Interest & Connection Operations ---
    def add_interest(self, from_user_id: str, to_user_id: str) -> None:
        self._interests.add((from_user_id, to_user_id))

    def has_interest(self, from_user_id: str, to_user_id: str) -> bool:
        return (from_user_id, to_user_id) in self._interests

    def get_user_expressed_interests(self, user_id: str) -> Set[str]:
        """Returns set of target user IDs that user_id has expressed interest in."""
        return {to_id for (from_id, to_id) in self._interests if from_id == user_id}

    def create_connection(self, user_a_id: str, user_b_id: str) -> Tuple[str, str]:
        """
        Creates a mutual connection and initializes a conversation thread.
        Returns (connection_id, conversation_id).
        """
        # Canonical order for ID
        pair = sorted([user_a_id, user_b_id])
        conn_id = f"conn-{pair[0]}-{pair[1]}"
        conv_id = f"conv-{pair[0]}-{pair[1]}"
        
        now_iso = datetime.now(timezone.utc).isoformat()
        
        self._connections[conn_id] = {
            "id": conn_id,
            "user_a_id": pair[0],
            "user_b_id": pair[1],
            "created_at": now_iso,
            "conversation_id": conv_id,
        }
        
        # Partner profile relative to user_a
        partner_profile = self.get_profile(user_b_id) or self.get_profile(user_a_id)
        if conv_id not in self._conversations and partner_profile:
            self._conversations[conv_id] = Conversation(
                id=conv_id,
                participant_ids=[user_a_id, user_b_id],
                partner=partner_profile,
                created_at=now_iso,
                last_active=now_iso,
                messages=[]
            )
            
        return conn_id, conv_id

    def list_user_connections(self, user_id: str) -> List[dict]:
        """Returns all mutual connections involving user_id."""
        results = []
        for conn in self._connections.values():
            if conn["user_a_id"] == user_id:
                partner = self.get_profile(conn["user_b_id"])
                if partner:
                    results.append({**conn, "partner": partner})
            elif conn["user_b_id"] == user_id:
                partner = self.get_profile(conn["user_a_id"])
                if partner:
                    results.append({**conn, "partner": partner})
        return results

    # --- Conversation Operations ---
    def get_conversation(self, conv_id: str) -> Optional[Conversation]:
        return self._conversations.get(conv_id)

    def list_user_conversations(self, user_id: str) -> List[Conversation]:
        user_convs = []
        for conv in self._conversations.values():
            if user_id in conv.participant_ids:
                # Set partner perspective
                other_id = [pid for pid in conv.participant_ids if pid != user_id]
                partner = self.get_profile(other_id[0]) if other_id else conv.partner
                conv_copy = conv.model_copy()
                if partner:
                    conv_copy.partner = partner
                user_convs.append(conv_copy)
        # Sort by last active descending
        user_convs.sort(key=lambda c: c.last_active, reverse=True)
        return user_convs

    def add_message_to_conversation(
        self, conv_id: str, message: ChatMessage
    ) -> Optional[Conversation]:
        conv = self._conversations.get(conv_id)
        if not conv:
            return None
        conv.messages.append(message)
        conv.last_active = message.timestamp
        return conv


# Global singleton instance
_repository_instance: Optional[InMemoryRepository] = None


def get_repository() -> InMemoryRepository:
    global _repository_instance
    if _repository_instance is None:
        _repository_instance = InMemoryRepository()
    return _repository_instance


def reset_repository() -> InMemoryRepository:
    """Helper for testing to reset repository state."""
    global _repository_instance
    _repository_instance = InMemoryRepository()
    return _repository_instance
