"use client";

import { useState, useEffect } from "react";
import { SuggestionResponse, SuggestionTones } from "@/types";
import { api } from "@/lib/api";
import {
  Sparkles,
  Smile,
  Flame,
  Heart,
  RotateCw,
  X,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface AiSuggestionModalProps {
  partnerId: string;
  partnerName: string;
  sharedInterests: string[];
  recentMessages: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (text: string, tone: "funny" | "flirty" | "sweet") => void;
}

export function AiSuggestionModal({
  partnerId,
  partnerName,
  sharedInterests,
  recentMessages,
  isOpen,
  onClose,
  onSelectSuggestion,
}: AiSuggestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<"funny" | "flirty" | "sweet" | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getChatSuggestions({
        partner_id: partnerId,
        current_user_id: "user-00",
        recent_messages: recentMessages,
      });
      setData(res);
      setSelectedTone(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data && !loading && !error) {
      fetchSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const toneCards = [
    {
      key: "funny" as const,
      title: "Witty & Playful",
      icon: Smile,
      color: "bg-[#FAF4FF] text-[#3B1E34] border-[#EAE3F7]",
      accentText: "text-[#3B1E34]",
      badge: "Funny",
    },
    {
      key: "flirty" as const,
      title: "Charming & Warm",
      icon: Flame,
      color: "bg-[#FDF2F4] text-[#D07086] border-[#FCDAE1]",
      accentText: "text-[#D07086]",
      badge: "Flirty",
    },
    {
      key: "sweet" as const,
      title: "Thoughtful & Sincere",
      icon: Heart,
      color: "bg-[#ECFDF3] text-[#2E7D58] border-[#C4EED8]",
      accentText: "text-[#2E7D58]",
      badge: "Sweet",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E8E1D5] shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E1D5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] text-[11px] font-semibold text-[#3B1E34] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D07086]" />
              <span>Groq AI Conversation Companion</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1F1A24]">
              Conversation Starters for {partnerName}
            </h3>
            <p className="text-xs text-[#645C6E] mt-0.5">
              Click any suggestion to insert it into your composer. You always review, edit, and send manually.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9B94A4] hover:text-[#1F1A24] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#645C6E] space-y-3">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#D07086]" />
              <p>Crafting natural conversation openers with Groq AI...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-[#FDF2F4] border border-[#FCDAE1] text-xs text-[#D07086] text-center">
              <AlertCircle className="w-5 h-5 mx-auto mb-1" />
              <p>{error}</p>
              <button
                onClick={fetchSuggestions}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#3B1E34] text-white text-xs font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-3">
              {toneCards.map((tone) => {
                const text = data.suggestions[tone.key];
                const Icon = tone.icon;
                const isChosen = selectedTone === tone.key;
                return (
                  <div
                    key={tone.key}
                    onClick={() => {
                      setSelectedTone(tone.key);
                      onSelectSuggestion(text, tone.key);
                    }}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                      isChosen
                        ? "border-[#3B1E34] bg-[#FAF4FF] shadow-sm ring-1 ring-[#3B1E34]"
                        : "border-[#E8E1D5] bg-white hover:border-[#D07086]/50 hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${tone.color}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-[#1F1A24]">{tone.title}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${tone.color}`}>
                        {tone.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1F1A24] leading-relaxed italic">
                      &ldquo;{text}&rdquo;
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-[#E8E1D5]/40 flex items-center justify-between text-[11px] text-[#645C6E]">
                      <span>Click to preview & insert</span>
                      {isChosen && (
                        <span className="text-[#2E7D58] font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Inserted into composer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Source & Safety Disclaimer */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-[11px] text-[#645C6E] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1F1A24] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D58]" /> Safety & Consent Assured
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#E8E1D5] text-[#3B1E34]">
                    Source: {data.source === "groq_llm" ? "Groq LLaMA" : "Offline Context Engine"}
                  </span>
                </div>
                <p>{data.safety_disclaimer}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between gap-3">
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#3B1E34] hover:bg-[#F3EEF9] transition-colors border border-[#E8E1D5]"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Regenerate Suggestions</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold hover:bg-[#4D2945] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
