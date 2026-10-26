"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Conversation } from "@/types";
import { api } from "@/lib/api";
import {
  MessageCircleHeart,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const res = await api.getConversations("user-00");
        setConversations(res.conversations);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E1D5]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] text-xs font-semibold text-[#3B1E34] mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D58]" />
          <span>Mutual Interest Only</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3B1E34]">
          Your Conversations
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#645C6E]">
          Threads are unlocked exclusively when both you and your match have expressed private interest.
        </p>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-[#E8E1D5] animate-pulse p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-[#FAF7F2] rounded w-1/4" />
                  <div className="h-3 bg-[#FAF7F2] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white border border-[#FCDAE1] p-8 text-center text-xs text-[#D07086]">
            <p className="font-semibold text-sm">Unable to load conversations</p>
            <p className="mt-1 text-[#645C6E]">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="card-warm rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] flex items-center justify-center text-[#3B1E34] mx-auto mb-4">
              <MessageCircleHeart className="w-8 h-8 text-[#D07086]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1F1A24]">
              No mutual connections yet
            </h3>
            <p className="text-xs sm:text-sm text-[#645C6E] max-w-md mx-auto mt-2 leading-relaxed">
              When you express interest in someone who also reciprocates, your private conversation
              will automatically appear here.
            </p>
            <div className="mt-6">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B1E34] text-white text-xs font-semibold hover:bg-[#4D2945] transition-all shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Compatible Matches</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              const lastMessage = conv.messages[conv.messages.length - 1];
              return (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="card-warm rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#E8E1D5] group-hover:border-[#D07086] transition-colors">
                        <img
                          src={conv.partner.avatar}
                          alt={conv.partner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#2E7D58] ring-2 ring-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h2 className="font-serif text-base font-bold text-[#1F1A24] group-hover:text-[#3B1E34] transition-colors truncate">
                          {conv.partner.name}
                        </h2>
                        <span className="text-xs text-[#645C6E] shrink-0">{conv.partner.age}</span>
                      </div>

                      <p className="text-xs text-[#645C6E] truncate mt-0.5 max-w-md">
                        {lastMessage ? (
                          <span>
                            {lastMessage.sender_id === "user-00" ? "You: " : ""}
                            {lastMessage.text}
                          </span>
                        ) : (
                          <span className="text-[#D07086] font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> New mutual match! Say hello.
                          </span>
                        )}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        {conv.partner.interests.slice(0, 2).map((i) => (
                          <span key={i} className="badge-tag badge-lavender text-[10px] py-0 px-2">
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#3B1E34] group-hover:translate-x-1 transition-transform">
                      Open Chat
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#3B1E34] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
