from typing import List, Optional, Set, Tuple
from backend.schemas.profile import Profile
from backend.schemas.match import MatchItem, MatchRequest, MatchResponse, MatchFilter
from backend.services.repository import InMemoryRepository, get_repository


class MatchingService:
    """
    Transparent, deterministic compatibility matching engine using Jaccard Similarity.
    
    Formula:
        J(A, B) = |A ∩ B| / |A ∪ B| * 100
    
    Principles:
    1. Deterministic & Transparent: Pure mathematical similarity without opaque black-box scores.
    2. Modesty: Does not claim scientific truth or destiny; frames similarity as conversational common ground.
    3. Safe Defaults: If both parties have empty interests, compatibility is explicitly marked as 'unknown' (0.0%).
    4. Deterministic Tie-Breaking: Sorted by (-score, candidate.name, candidate.id).
    """

    def __init__(self, repository: Optional[InMemoryRepository] = None):
        self.repository = repository or get_repository()

    @staticmethod
    def _normalize_interest(interest: str) -> str:
        return interest.strip().lower()

    def calculate_jaccard_similarity(
        self, user_interests: List[str], candidate_interests: List[str]
    ) -> Tuple[float, List[str], List[str], List[str], str]:
        """
        Calculates Jaccard similarity between two lists of interests.
        Returns:
            (score, shared_interests, unique_user_interests, unique_candidate_interests, status)
        """
        # Map normalized -> canonical display string
        user_norm_map = {self._normalize_interest(i): i for i in user_interests if i.strip()}
        cand_norm_map = {self._normalize_interest(i): i for i in candidate_interests if i.strip()}

        user_set = set(user_norm_map.keys())
        cand_set = set(cand_norm_map.keys())

        # Edge case: both have zero interests
        if not user_set and not cand_set:
            return 0.0, [], [], [], "unknown"

        # Edge case: one has zero interests
        if not user_set or not cand_set:
            unique_user = [user_norm_map[k] for k in sorted(user_set)]
            unique_cand = [cand_norm_map[k] for k in sorted(cand_set)]
            return 0.0, [], unique_user, unique_cand, "exploratory"

        intersection = user_set.intersection(cand_set)
        union = user_set.union(cand_set)

        if not union:
            return 0.0, [], [], [], "unknown"

        raw_score = (len(intersection) / len(union)) * 100.0
        score = round(raw_score, 1)

        shared = [cand_norm_map[k] for k in sorted(intersection)]
        unique_user = [user_norm_map[k] for k in sorted(user_set - intersection)]
        unique_cand = [cand_norm_map[k] for k in sorted(cand_set - intersection)]

        if score >= 50.0:
            status = "high"
        elif score >= 25.0:
            status = "moderate"
        elif score > 0.0:
            status = "low"
        else:
            status = "exploratory"

        return score, shared, unique_user, unique_cand, status

    @staticmethod
    def generate_explanation(
        candidate_name: str,
        score: float,
        shared: List[str],
        unique_candidate: List[str],
        status: str,
    ) -> str:
        """Generates a modest, transparent, human-readable rationale."""
        if status == "unknown":
            return (
                "Compatibility is currently unknown because neither profile lists "
                "specific interests yet. A conversation is the best way to uncover shared ground."
            )

        if not shared:
            sample_unique = ", ".join(unique_candidate[:2]) if unique_candidate else "fresh hobbies"
            return (
                f"You and {candidate_name} don't have overlapping interests listed yet. "
                f"This offers a fresh dynamic to introduce each other to new worlds like {sample_unique}."
            )

        if len(shared) == 1:
            shared_str = shared[0]
            return (
                f"You both share an appreciation for {shared_str}. "
                f"A natural conversational hook for trading perspectives and favorites."
            )

        if len(shared) == 2:
            return (
                f"Strong common ground: you both connect over {shared[0]} and {shared[1]}. "
                f"Great starting points for an easy, engaging first conversation."
            )

        shared_lead = ", ".join(shared[:2])
        shared_rest = shared[2] if len(shared) == 3 else f"{len(shared) - 2} other interests"
        return (
            f"High natural compatibility: you share {shared_lead}, and {shared_rest}. "
            f"Significant lifestyle and conversational alignment."
        )

    def find_matches(self, request: MatchRequest) -> MatchResponse:
        """
        Executes candidate filtering, Jaccard compatibility scoring,
        deterministic ranking, and explanation generation.
        """
        # Determine base user profile and interests
        current_user = None
        base_interests = []

        if request.user_id:
            current_user = self.repository.get_profile(request.user_id)

        if request.custom_interests is not None:
            base_interests = request.custom_interests
        elif current_user:
            base_interests = current_user.interests

        all_profiles = self.repository.list_all_profiles()
        filtered_candidates: List[Profile] = []

        for p in all_profiles:
            # 1. Exclude the current user
            if current_user and p.id == current_user.id:
                continue
            if request.user_id and p.id == request.user_id:
                continue

            # 2. Age filters
            if request.filters:
                if request.filters.min_age and p.age < request.filters.min_age:
                    continue
                if request.filters.max_age and p.age > request.filters.max_age:
                    continue
                
                # 3. Must include specific interests filter
                if request.filters.must_include_interests:
                    req_norm = {self._normalize_interest(i) for i in request.filters.must_include_interests}
                    cand_norm = {self._normalize_interest(i) for i in p.interests}
                    if not req_norm.issubset(cand_norm):
                        continue

            filtered_candidates.append(p)

        # Calculate compatibility for each candidate
        scored_items: List[MatchItem] = []
        for candidate in filtered_candidates:
            score, shared, unique_user, unique_cand, status = self.calculate_jaccard_similarity(
                base_interests, candidate.interests
            )
            explanation = self.generate_explanation(
                candidate_name=candidate.name,
                score=score,
                shared=shared,
                unique_candidate=unique_cand,
                status=status,
            )
            scored_items.append(
                MatchItem(
                    profile=candidate,
                    compatibility_score=score,
                    shared_interests=shared,
                    unique_user_interests=unique_user,
                    unique_candidate_interests=unique_cand,
                    explanation=explanation,
                    status=status,
                )
            )

        # Deterministic sorting:
        # Primary: compatibility_score descending
        # Secondary: candidate name ascending
        # Tertiary: candidate id ascending
        scored_items.sort(key=lambda item: (-item.compatibility_score, item.profile.name, item.profile.id))

        # Limit to top N
        top_matches = scored_items[: request.limit]

        return MatchResponse(
            current_user_id=request.user_id,
            evaluated_interests=base_interests,
            total_candidates_evaluated=len(filtered_candidates),
            returned_count=len(top_matches),
            matches=top_matches,
        )
