from typing import List
from pydantic import BaseModel, Field


class QuestionItem(BaseModel):
    id: str = Field(..., description="Unique question identifier")
    category: str = Field(..., description="Question theme / topic")
    prompt: str = Field(..., description="Conversational context or prompt")
    option_a: str = Field(..., description="First choice")
    option_b: str = Field(..., description="Second choice")


class GameQuestionsResponse(BaseModel):
    total: int = Field(..., description="Total available questions")
    game_type: str = Field("Would You Rather", description="Game title")
    description: str = Field(
        "A playful icebreaker to explore values, habits, and imagination with depth.",
        description="Game summary"
    )
    questions: List[QuestionItem]
