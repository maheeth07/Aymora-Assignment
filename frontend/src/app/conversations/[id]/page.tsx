"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Conversation, ChatMessage } from "@/types";
import { api } from "@/lib/api";
import { AiSuggestionModal } from "@/components/chat/AiSuggestionModal";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Gamepad2,
  ShieldCheck,
  CheckCheck,
  Info,
} from "lucide-react";

function ConversationInner() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Composer State
  const [messageText, setMessageText] = useState("");
  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"funny" | "flirty" | "sweet" | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    try {
      const conv = await api.getConversationById(conversationId);
      setConversation(conv);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const newMsg = await api.sendMessage(conversationId, {
        sender_id: "user-00",
        text: messageText.trim(),
        is_ai_assisted: isAiAssisted,
        tone: selectedTone,
      });

      // Append locally
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
        };
      });

      // Reset composer
      setMessageText("");
      setIsAiAssisted(false);
      setSelectedTone(undefined);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleSuggestionInserted = (text: string, tone: "funny" | "flirty" | "sweet") => {
    setMessageText(text);
    setIsAiAssisted(true);
    setSelectedTone(tone);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs text-[#645C6E]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3B1E34] border-t-transparent animate-spin mx-auto mb-3" />
        <p>Loading private conversation thread...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-[#D07086]">{error || "Conversation not found."}</p>
        <button
          onClick={() => router.push("/conversations")}
          className="mt-4 px-4 py-2 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold"
        >
          Return to Conversations
        </button>
      </div>
    );
  }

  const partner = conversation.partner;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="card-warm rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/conversations")}
            className="p-1.5 rounded-full text-[#645C6E] hover:bg-[#FAF7F2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link
            href={`/profile/${partner.id}`}
            className="flex items-center gap-3 group min-w-0"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8E1D5]">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2E7D58] ring-2 ring-white" />
            </div>

            <div className="min-w-0">
              <h2 className="font-serif text-base font-bold text-[#1F1A24] group-hover:text-[#3B1E34] transition-colors flex items-center gap-1.5 truncate">
                <span>{partner.name}</span>
                <span className="text-xs font-normal text-[#645C6E]">{partner.age}</span>
              </h2>
              <p className="text-[11px] text-[#645C6E] truncate">
                {partner.occupation || "Mutual Connection"}
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2">
          <Link
            href="/games/would-you-rather"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF2F4] text-[#D07086] border border-[#FCDAE1] text-xs font-semibold hover:bg-[#FCE8ED] transition-colors"
            title="Play Would You Rather with this match"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Play Icebreaker</span>
          </Link>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white border border-[#E8E1D5] space-y-3 mb-3 shadow-xs">
        {/* Privacy & Mutual Connection Banner */}
        <div className="py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-center max-w-sm mx-auto text-[11px] text-[#645C6E]">
          <p className="font-semibold text-[#1F1A24] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D58]" />
            <span>Mutual Connection Established</span>
          </p>
          <p className="mt-0.5">
            You and {partner.name} both expressed interest privately. This thread is private to both of you.
          </p>
        </div>

        {conversation.messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#645C6E] space-y-2">
            <Sparkles className="w-8 h-8 text-[#D07086] mx-auto opacity-70" />
            <p className="font-serif text-sm font-bold text-[#1F1A24]">
              Start your first conversation with {partner.name}
            </p>
            <p className="text-[11px] max-w-xs mx-auto">
              Use the AI suggestions companion below for three customized conversation starters based on your shared interests.
            </p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isMe = msg.sender_id === "user-00";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? "bg-[#3B1E34] text-white rounded-br-sm"
                      : "bg-[#FAF4FF] text-[#1F1A24] border border-[#EAE3F7] rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Message Meta Info */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-[#9B94A4]">
                  {msg.is_ai_assisted && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#FDF2F4] text-[#D07086] font-medium border border-[#FCDAE1]">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI {msg.tone || "assisted"}</span>
                    </span>
                  )}
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-[#2E7D58]" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Spark Preview Indicator */}
      {isAiAssisted && (
        <div className="mb-2 p-2 px-3 rounded-xl bg-[#FAF4FF] border border-[#EAE3F7] flex items-center justify-between text-xs text-[#3B1E34]">
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D07086]" />
            <span>AI Draft ({selectedTone} tone) loaded. You can freely edit or rephrase below.</span>
          </span>
          <button
            onClick={() => {
              setIsAiAssisted(false);
              setSelectedTone(undefined);
            }}
            className="text-[10px] underline text-[#645C6E] hover:text-[#1F1A24]"
          >
            Clear tag
          </button>
        </div>
      )}

      {/* Composer Area */}
      <form
        onSubmit={handleSendMessage}
        className="card-warm rounded-2xl p-2 sm:p-3 bg-white border border-[#E8E1D5] flex items-end gap-2"
      >
        {/* Trigger AI Suggestions Button */}
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF4FF] text-[#3B1E34] hover:bg-[#F3EEF9] border border-[#EAE3F7] text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          title="Open Groq AI Conversation Suggestions"
        >
          <Sparkles className="w-4 h-4 text-[#D07086]" />
          <span className="hidden sm:inline">AI Suggestions</span>
        </button>

        {/* Message Input */}
        <textarea
          rows={1}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Message ${partner.name}...`}
          className="flex-1 py-2 px-3 text-xs sm:text-sm bg-transparent resize-none focus:outline-none max-h-24 text-[#1F1A24] placeholder-[#9B94A4]"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!messageText.trim() || sending}
          className="p-2.5 rounded-xl bg-[#3B1E34] text-white hover:bg-[#4D2945] disabled:opacity-40 disabled:hover:bg-[#3B1E34] transition-all shrink-0 shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* AI Suggestion Companion Modal */}
      <AiSuggestionModal
        partnerId={partner.id}
        partnerName={partner.name}
        sharedInterests={partner.interests}
        recentMessages={conversation.messages.map((m) => m.text)}
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSelectSuggestion={handleSuggestionInserted}
      />
    </div>
  );
}

export default function IndividualConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs text-[#645C6E]">
          <div className="w-8 h-8 rounded-full border-2 border-[#3B1E34] border-t-transparent animate-spin mx-auto mb-3" />
          <p>Loading conversation thread...</p>
        </div>
      }
    >
      <ConversationInner />
    </Suspense>
  );
}
