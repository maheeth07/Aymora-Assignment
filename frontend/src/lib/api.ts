import {
  Profile,
  ProfileListResponse,
  MatchRequest,
  MatchResponse,
  InterestRequest,
  InterestResponse,
  ConnectionListResponse,
  Conversation,
  ConversationListResponse,
  ChatMessage,
  SendMessageRequest,
  GameQuestionsResponse,
  SuggestionRequest,
  SuggestionResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorMsg = typeof errorData.detail === "string" 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unexpected network error occurred while contacting the server.");
  }
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; service: string; version: string }>("/api/health"),

  // Current User
  getCurrentUser: (): Promise<Profile> => fetchJson<Profile>("/api/profiles/me"),

  // Profiles
  getProfiles: (excludeCurrent = false, interest?: string): Promise<ProfileListResponse> => {
    const params = new URLSearchParams();
    if (excludeCurrent) params.append("exclude_current", "true");
    if (interest) params.append("interest", interest);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return fetchJson<ProfileListResponse>(`/api/profiles${qs}`);
  },

  getProfileById: (id: string): Promise<Profile> =>
    fetchJson<Profile>(`/api/profiles/${encodeURIComponent(id)}`),

  // Matches
  getMatches: (req: MatchRequest): Promise<MatchResponse> =>
    fetchJson<MatchResponse>("/api/matches", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Connections & Mutual Interest
  expressInterest: (req: InterestRequest): Promise<InterestResponse> =>
    fetchJson<InterestResponse>("/api/connections/interest", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  getConnections: (userId = "user-00"): Promise<ConnectionListResponse> =>
    fetchJson<ConnectionListResponse>(`/api/connections?user_id=${encodeURIComponent(userId)}`),

  // Conversations
  getConversations: (userId = "user-00"): Promise<ConversationListResponse> =>
    fetchJson<ConversationListResponse>(`/api/conversations?user_id=${encodeURIComponent(userId)}`),

  getConversationById: (convId: string): Promise<Conversation> =>
    fetchJson<Conversation>(`/api/conversations/${encodeURIComponent(convId)}`),

  sendMessage: (convId: string, req: SendMessageRequest): Promise<ChatMessage> =>
    fetchJson<ChatMessage>(`/api/conversations/${encodeURIComponent(convId)}/messages`, {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // AI Chat Suggestions (Groq)
  getChatSuggestions: (req: SuggestionRequest): Promise<SuggestionResponse> =>
    fetchJson<SuggestionResponse>("/api/chat/suggestions", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // Conversation Games
  getWouldYouRatherQuestions: (): Promise<GameQuestionsResponse> =>
    fetchJson<GameQuestionsResponse>("/api/games/would-you-rather"),
};
