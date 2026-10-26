"use client";

import { useEffect, useState, useTransition } from "react";
import { MatchResponse, MatchItem, InterestResponse } from "@/types";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/discovery/MatchCard";
import {
  Compass,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";

const ALL_AVAILABLE_INTERESTS = [
  "Specialty Coffee",
  "Modern Architecture",
  "Analog Photography",
  "Ceramics",
  "Indie Cinema",
  "Bouldering",
  "Jazz & Vinyl",
  "Urban Gardening",
  "Creative Writing",
  "Contemporary Art",
  "Thrifting & Vintage",
  "Cooking Regional Italian",
  "Sci-Fi Literature",
  "Board Games",
  "Cycling",
  "Fermentation & Sourdough",
];

export default function DiscoverPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active user's selected interests (defaults to Maya Lin's seed interests)
  const [userInterests, setUserInterests] = useState<string[]>([
    "Specialty Coffee",
    "Modern Architecture",
    "Analog Photography",
    "Ceramics",
    "Indie Cinema",
    "Bouldering",
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 45]);
  const [isPending, startTransition] = useTransition();

  // Notification Modal / Banner state
  const [interestFeedback, setInterestFeedback] = useState<{
    response: InterestResponse;
    partnerName: string;
  } | null>(null);

  const fetchMatches = async (interests: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMatches({
        user_id: "user-00",
        custom_interests: interests,
        limit: 15,
        filters: {
          min_age: ageRange[0],
          max_age: ageRange[1],
        },
      });
      setMatches(res.matches);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(userInterests);
  }, []);

  const toggleInterest = (interest: string) => {
    const updated = userInterests.includes(interest)
      ? userInterests.filter((i) => i !== interest)
      : [...userInterests, interest];
    setUserInterests(updated);
    startTransition(() => {
      fetchMatches(updated);
    });
  };

  const handleInterestResult = (result: InterestResponse, partnerName: string) => {
    setInterestFeedback({ response: result, partnerName });
  };

  // Local search filter
  const displayedMatches = matches.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.profile.name.toLowerCase().includes(query) ||
      m.profile.occupation?.toLowerCase().includes(query) ||
      m.profile.interests.some((i) => i.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E1D5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] text-xs font-semibold text-[#3B1E34] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#3B1E34]" />
            <span>Deterministic Jaccard Matching</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3B1E34]">
            Smart Compatibility Discovery
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#645C6E]">
            Ranked purely by interest overlap and transparent shared values. Up to 10 top matches shown.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B94A4]" />
          <input
            type="text"
            placeholder="Search name, hobby, occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E8E1D5] text-[#1F1A24] placeholder-[#9B94A4] focus:outline-none focus:border-[#3B1E34]"
          />
        </div>
      </div>

      {/* Interactive Active User Interest Bar */}
      <section className="mt-6 p-5 rounded-2xl bg-white border border-[#E8E1D5] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-serif font-bold text-[#3B1E34] flex items-center gap-1.5">
              <span>Your Active Compatibility Profile</span>
              <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#F3EEF9] text-[#3B1E34]">
                {userInterests.length} Selected
              </span>
            </h2>
            <p className="text-xs text-[#645C6E]">
              Click interest tags to toggle your simulated preferences and watch compatibility scores recalculate live:
            </p>
          </div>
          <button
            onClick={() => {
              const def = ["Specialty Coffee", "Modern Architecture", "Analog Photography", "Ceramics", "Indie Cinema", "Bouldering"];
              setUserInterests(def);
              fetchMatches(def);
            }}
            className="self-start sm:self-auto text-[11px] text-[#645C6E] hover:text-[#3B1E34] flex items-center gap-1 underline underline-offset-2"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Maya&apos;s defaults
          </button>
        </div>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = userInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`badge-tag text-xs font-medium cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#3B1E34] text-white border border-[#3B1E34] shadow-xs"
                    : "bg-[#FAF7F2] text-[#645C6E] border border-[#E8E1D5] hover:border-[#3B1E34]/40"
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      {/* Interest Feedback Modal / Alert */}
      {interestFeedback && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E1D5] shadow-lg relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => setInterestFeedback(null)}
            className="absolute top-3 right-3 text-[#9B94A4] hover:text-[#1F1A24]"
            aria-label="Close message"
          >
            <X className="w-4 h-4" />
          </button>

          {interestFeedback.response.is_mutual ? (
            /* Mutual Connection Feedback */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ECFDF3] border border-[#C4EED8] flex items-center justify-center text-[#2E7D58] shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-[#2E7D58]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1F1A24] flex items-center gap-2">
                    <span>It&apos;s Mutual! Connection Established</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#2E7D58] font-sans font-semibold">
                      Mutual Spark
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#645C6E] mt-0.5">
                    {interestFeedback.response.message}
                  </p>
                </div>
              </div>
              {interestFeedback.response.conversation_id && (
                <Link
                  href={`/conversations/${interestFeedback.response.conversation_id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold hover:bg-[#4D2945] transition-all shadow-sm shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#FAF7F2]" />
                  <span>Start Conversation</span>
                </Link>
              )}
            </div>
          ) : (
            /* Private Pending Interest Feedback */
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF4FF] border border-[#EAE3F7] flex items-center justify-center text-[#3B1E34] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-[#3B1E34]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#1F1A24]">
                  Interest Recorded Privately
                </h3>
                <p className="text-xs sm:text-sm text-[#645C6E] mt-0.5">
                  {interestFeedback.response.message}
                </p>
                <p className="text-[11px] text-[#9B94A4] mt-1 italic">
                  * {interestFeedback.response.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matches Grid */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#645C6E]">
            Compatible Profiles ({displayedMatches.length})
          </p>
          <span className="text-xs text-[#9B94A4]">
            Formula: intersection / union × 100
          </span>
        </div>

        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white border border-[#E8E1D5] animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="h-56 bg-[#FAF7F2] rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-[#FAF7F2] rounded w-3/4" />
                  <div className="h-3 bg-[#FAF7F2] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-2xl bg-white border border-[#FCDAE1] p-8 text-center text-xs text-[#D07086]">
            <p className="font-semibold text-sm">Unable to compute compatibility</p>
            <p className="mt-1 text-[#645C6E]">{error}</p>
            <button
              onClick={() => fetchMatches(userInterests)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : displayedMatches.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl bg-white border border-[#E8E1D5] p-12 text-center text-[#645C6E]">
            <Compass className="w-10 h-10 text-[#9B94A4] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#1F1A24]">
              No profiles match your search criteria
            </h3>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              Try adding more interests to your profile or clearing your search keywords.
            </p>
          </div>
        ) : (
          /* Match Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMatches.map((match) => (
              <MatchCard
                key={match.profile.id}
                match={match}
                currentUserId="user-00"
                onInterestExpressed={handleInterestResult}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
