export interface Preferences {
  looking_for?: string;
  communication_style?: string;
  dealbreaker?: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  pronouns?: string;
  location?: string;
  occupation?: string;
  bio: string;
  avatar: string;
  interests: string[];
  preferences?: Preferences;
  is_current_user?: boolean;
}

export interface ProfileListResponse {
  total: number;
  profiles: Profile[];
}

export interface MatchItem {
  profile: Profile;
  compatibility_score: number;
  shared_interests: string[];
  unique_user_interests: string[];
  unique_candidate_interests: string[];
  explanation: string;
  status: "high" | "moderate" | "low" | "unknown" | "exploratory";
}

export interface MatchFilter {
  min_age?: number;
  max_age?: number;
  must_include_interests?: string[];
}

export interface MatchRequest {
  user_id?: string;
  custom_interests?: string[];
  filters?: MatchFilter;
  limit?: number;
}

export interface MatchResponse {
  current_user_id?: string;
  evaluated_interests: string[];
  total_candidates_evaluated: number;
  returned_count: number;
  matches: MatchItem[];
}

export interface InterestRequest {
  from_user_id: string;
  to_user_id: string;
}

export interface InterestResponse {
  status: "interest_recorded_privately" | "mutual_connection_created" | "invalid_self_interest" | "candidate_not_found";
  is_mutual: boolean;
  message: string;
  conversation_id?: string;
  partner?: Profile;
  disclaimer: string;
}

export interface ConnectionItem {
  connection_id: string;
  partner: Profile;
  connected_at: string;
  conversation_id: string;
  last_message?: string;
}

export interface ConnectionListResponse {
  total: number;
  connections: ConnectionItem[];
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  is_ai_assisted?: boolean;
  tone?: "funny" | "flirty" | "sweet";
}

export interface SendMessageRequest {
  sender_id: string;
  text: string;
  is_ai_assisted?: boolean;
  tone?: "funny" | "flirty" | "sweet";
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  partner: Profile;
  messages: ChatMessage[];
  created_at: string;
  last_active: string;
}

export interface ConversationListResponse {
  total: number;
  conversations: Conversation[];
}

export interface QuestionItem {
  id: string;
  category: string;
  prompt: string;
  option_a: string;
  option_b: string;
}

export interface GameQuestionsResponse {
  total: number;
  game_type: string;
  description: string;
  questions: QuestionItem[];
}

export interface SuggestionTones {
  funny: string;
  flirty: string;
  sweet: string;
}

export interface SuggestionRequest {
  conversation_id?: string;
  partner_id: string;
  current_user_id?: string;
  recent_messages?: string[];
  context_note?: string;
}

export interface SuggestionResponse {
  suggestions: SuggestionTones;
  source: "groq_llm" | "contextual_fallback";
  model?: string;
  partner_name: string;
  shared_interests: string[];
  generated_at: string;
  safety_disclaimer: string;
}
