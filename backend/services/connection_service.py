from typing import Optional
from backend.schemas.connection import InterestRequest, InterestResponse, ConnectionListResponse, ConnectionItem
from backend.services.repository import InMemoryRepository, get_repository


class ConnectionService:
    """
    Privacy-Conscious Mutual Connection Service for Aymora Spark.
    
    Principles:
    1. Radical Privacy: Expressing interest is strictly one-way and private.
       A user never learns that someone liked them unless they also reciprocate interest.
    2. Zero Public Likes / Counts: No public like counters or vanity metrics.
    3. Instant Reciprocal Match: If both users have registered interest,
       a mutual connection is established and an initial conversation thread is unlocked.
    4. Simulation Disclosure: State is maintained in-memory for this prototype.
    """

    def __init__(self, repository: Optional[InMemoryRepository] = None):
        self.repository = repository or get_repository()

    def process_interest(self, request: InterestRequest) -> InterestResponse:
        from_id = request.from_user_id
        to_id = request.to_user_id

        # Verify candidate exists
        candidate = self.repository.get_profile(to_id)
        if not candidate:
            return InterestResponse(
                status="candidate_not_found",
                is_mutual=False,
                message=f"Profile '{to_id}' was not found in the directory."
            )

        if from_id == to_id:
            return InterestResponse(
                status="invalid_self_interest",
                is_mutual=False,
                message="You cannot express interest in your own profile."
            )

        # 1. Record current user's interest privately
        self.repository.add_interest(from_id, to_id)

        # 2. Check if recipient has ALREADY expressed interest in sender
        has_reciprocated = self.repository.has_interest(to_id, from_id)

        if has_reciprocated:
            # Both sides have expressed interest: trigger mutual connection!
            conn_id, conv_id = self.repository.create_connection(from_id, to_id)
            return InterestResponse(
                status="mutual_connection_created",
                is_mutual=True,
                message=(
                    f"It's mutual! You and {candidate.name} have both expressed private interest. "
                    f"A private conversation thread is now open."
                ),
                conversation_id=conv_id,
                partner=candidate
            )
        else:
            # Interest is one-way and remains strictly private
            return InterestResponse(
                status="interest_recorded_privately",
                is_mutual=False,
                message=(
                    f"Your interest in {candidate.name} has been recorded privately. "
                    f"They will only be notified if they independently express interest in you."
                ),
                conversation_id=None,
                partner=None
            )

    def list_connections(self, user_id: str) -> ConnectionListResponse:
        """Returns all confirmed mutual connections for user_id."""
        raw_conns = self.repository.list_user_connections(user_id)
        items = []
        for c in raw_conns:
            # Fetch last message if available
            conv = self.repository.get_conversation(c["conversation_id"])
            last_msg = conv.messages[-1].text if conv and conv.messages else None
            
            items.append(
                ConnectionItem(
                    connection_id=c["id"],
                    partner=c["partner"],
                    connected_at=c["created_at"],
                    conversation_id=c["conversation_id"],
                    last_message=last_msg
                )
            )
        return ConnectionListResponse(total=len(items), connections=items)
