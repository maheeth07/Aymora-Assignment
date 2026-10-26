"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuestionItem } from "@/types";
import { api } from "@/lib/api";
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Compass,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export default function WouldYouRatherGamePage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game Play State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);
  const [answeredHistory, setAnsweredHistory] = useState<
    { questionId: string; choice: "A" | "B" }[]
  >([]);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const res = await api.getWouldYouRatherQuestions();
        setQuestions(res.questions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleSelect = (choice: "A" | "B") => {
    setSelectedChoice(choice);
    const q = questions[currentIndex];
    if (q) {
      setAnsweredHistory((prev) => [
        ...prev.filter((item) => item.questionId !== q.id),
        { questionId: q.id, choice },
      ]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAnsweredHistory([]);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-xs text-[#645C6E]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3B1E34] border-t-transparent animate-spin mx-auto mb-3" />
        <p>Loading icebreaker questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-[#D07086]">{error || "No questions found."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isFinished = currentIndex === questions.length - 1 && selectedChoice !== null;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {/* Game Header */}
      <div className="text-center pb-6 border-b border-[#E8E1D5]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] text-xs font-semibold text-[#3B1E34] mb-2 shadow-xs">
          <Gamepad2 className="w-3.5 h-3.5 text-[#D07086]" />
          <span>Interactive Conversation Game</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3B1E34]">
          Would You Rather?
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#645C6E] max-w-md mx-auto">
          Thought-provoking lifestyle, travel, and creative dilemmas designed to spark authentic rapport.
        </p>

        {/* Progress Bar & Counter */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-[#645C6E] mb-1.5 font-medium">
            <span>
              Question <strong className="text-[#3B1E34]">{currentIndex + 1}</strong> of{" "}
              {questions.length}
            </span>
            <span className="text-[11px] font-semibold text-[#D07086]">
              {progressPercent}% Completed
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#E8E1D5] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B1E34] to-[#D07086] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="mt-8 space-y-6">
        {/* Category & Prompt */}
        <div className="text-center space-y-2">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#D07086] px-2.5 py-0.5 rounded-full bg-[#FDF2F4] border border-[#FCDAE1]">
            {currentQ.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1A24] max-w-xl mx-auto leading-snug">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Choices Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Choice A */}
          <div
            onClick={() => handleSelect("A")}
            className={`card-warm rounded-2xl p-5 sm:p-6 cursor-pointer border-2 transition-all flex flex-col justify-between ${
              selectedChoice === "A"
                ? "border-[#3B1E34] bg-[#FAF4FF] shadow-md ring-2 ring-[#3B1E34]/20 scale-[1.01]"
                : "border-[#E8E1D5] bg-white hover:border-[#D07086]/50 hover:bg-[#FAF7F2]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-full bg-[#3B1E34] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  A
                </span>
                {selectedChoice === "A" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D58] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#C4EED8]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-[#1F1A24] font-medium leading-relaxed">
                {currentQ.option_a}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D5]/40 text-[11px] text-[#645C6E]">
              {selectedChoice === "A"
                ? "A telling reflection of what you prioritize!"
                : "Click to select option A"}
            </div>
          </div>

          {/* Choice B */}
          <div
            onClick={() => handleSelect("B")}
            className={`card-warm rounded-2xl p-5 sm:p-6 cursor-pointer border-2 transition-all flex flex-col justify-between ${
              selectedChoice === "B"
                ? "border-[#D07086] bg-[#FDF2F4] shadow-md ring-2 ring-[#D07086]/20 scale-[1.01]"
                : "border-[#E8E1D5] bg-white hover:border-[#D07086]/50 hover:bg-[#FAF7F2]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-full bg-[#D07086] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  B
                </span>
                {selectedChoice === "B" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D07086] bg-white px-2 py-0.5 rounded-full border border-[#FCDAE1]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-[#1F1A24] font-medium leading-relaxed">
                {currentQ.option_b}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E1D5]/40 text-[11px] text-[#645C6E]">
              {selectedChoice === "B"
                ? "A revealing glimpse into your spirit!"
                : "Click to select option B"}
            </div>
          </div>
        </div>

        {/* Selected Answer Confirmation Box */}
        {selectedChoice && (
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] text-xs text-[#645C6E] flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D07086]" />
              <span>
                You picked{" "}
                <strong className="text-[#1F1A24]">
                  Option {selectedChoice}
                </strong>
                . Great icebreaker topic to ask in your next conversation!
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#645C6E] hover:text-[#1F1A24] hover:bg-[#FAF7F2] transition-colors border border-[#E8E1D5]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Game</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={selectedChoice === null}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold hover:bg-[#4D2945] disabled:opacity-40 transition-all shadow-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FAF7F2]" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/conversations"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2E7D58] text-white text-xs font-semibold hover:bg-[#256647] transition-all shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Discuss with Match</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
