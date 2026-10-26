"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Profile, MatchItem, InterestResponse } from "@/types";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  MapPin,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Clock,
  Compass,
} from "lucide-react";
import Link from "next/link";

function ProfileDetailInner() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [matchData, setMatchData] = useState<MatchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [interestFeedback, setInterestFeedback] = useState<InterestResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profData, matchRes] = await Promise.all([
          api.getProfileById(profileId),
          api.getMatches({ user_id: "user-00", limit: 20 }),
        ]);
        setProfile(profData);
        const currentMatch = matchRes.matches.find((m) => m.profile.id === profileId);
        setMatchData(currentMatch || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    if (profileId) {
      loadData();
    }
  }, [profileId]);

  const handleExpressInterest = async () => {
    if (!profile) return;
    try {
      const res = await api.expressInterest({
        from_user_id: "user-00",
        to_user_id: profile.id,
      });
      setLiked(true);
      setInterestFeedback(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not express interest.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#645C6E]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3B1E34] border-t-transparent animate-spin mx-auto mb-3" />
        <p>Loading profile & compatibility calculation...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-[#D07086]">{error || "Profile not found."}</p>
        <button
          onClick={() => router.push("/discover")}
          className="mt-4 px-4 py-2 rounded-xl bg-[#3B1E34] text-white text-xs font-semibold"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#645C6E] hover:text-[#1F1A24] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Matches</span>
      </button>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Portrait & Quick Actions */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-md bg-white border border-[#E8E1D5]">
            <div className="h-96 sm:h-[420px] w-full">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-baseline gap-2">
                <h1 className="font-serif text-3xl font-bold">{profile.name}</h1>
                <span className="text-xl text-white/90">{profile.age}</span>
              </div>
              {profile.pronouns && (
                <p className="text-xs text-white/70 italic mt-0.5">{profile.pronouns}</p>
              )}
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="card-warm rounded-2xl p-4 space-y-3">
            <button
              onClick={handleExpressInterest}
              disabled={liked}
              className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                liked
                  ? "bg-[#FDF2F4] text-[#D07086] border border-[#FCDAE1] cursor-default"
                  : "bg-[#3B1E34] text-white hover:bg-[#4D2945]"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-[#D07086] text-[#D07086]" : "text-[#FAF7F2]"}`} />
              <span>{liked ? "Interest Expressed Privately" : "Express Private Interest"}</span>
            </button>
            <p className="text-[11px] text-[#9B94A4] text-center leading-relaxed">
              Your interest is 100% private. Neither user is notified unless interest is mutual.
            </p>
          </div>

          {/* Feedback Banner */}
          {interestFeedback && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-300 ${
              interestFeedback.is_mutual
                ? "bg-[#ECFDF3] border-[#C4EED8] text-[#2E7D58]"
                : "bg-[#FAF4FF] border-[#EAE3F7] text-[#3B1E34]"
            }`}>
              <p className="font-semibold">{interestFeedback.message}</p>
              {interestFeedback.conversation_id && (
                <Link
                  href={`/conversations/${interestFeedback.conversation_id}`}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E7D58] text-white font-medium hover:bg-[#256647] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>Open Conversation Thread</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Bio, Compatibility Breakdown, Preferences */}
        <div className="md:col-span-7 space-y-6">
          {/* Header Info */}
          <div className="card-warm rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#645C6E] pb-4 border-b border-[#E8E1D5]">
              {profile.occupation && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#3B1E34]" />
                  <span>{profile.occupation}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D07086]" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#645C6E] mb-2">
                About {profile.name}
              </h2>
              <p className="text-sm text-[#1F1A24] leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Jaccard Compatibility Breakdown */}
          {matchData && (
            <div className="card-warm rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D07086]" />
                  <h2 className="font-serif text-lg font-bold text-[#3B1E34]">
                    Compatibility Analysis
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF4FF] text-[#3B1E34] border border-[#EAE3F7]">
                  {matchData.compatibility_score.toFixed(0)}% Jaccard Match
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs leading-relaxed text-[#645C6E]">
                <p className="font-semibold text-[#1F1A24] mb-1">Transparent Explanation</p>
                <p>{matchData.explanation}</p>
              </div>

              {/* Shared Interests */}
              <div>
                <p className="text-xs font-semibold text-[#3B1E34] mb-2">
                  Shared Interests ({matchData.shared_interests.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.shared_interests.map((interest) => (
                    <span
                      key={interest}
                      className="badge-tag badge-shared text-xs"
                    >
                      ★ {interest}
                    </span>
                  ))}
                  {matchData.shared_interests.length === 0 && (
                    <span className="text-xs text-[#9B94A4] italic">
                      No exact overlapping tags listed. A chance to introduce each other to new passions!
                    </span>
                  )}
                </div>
              </div>

              {/* Unique Interests */}
              {matchData.unique_candidate_interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#645C6E] mb-2">
                    {profile.name}&apos;s Unique Interests
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.unique_candidate_interests.map((interest) => (
                      <span
                        key={interest}
                        className="badge-tag badge-lavender text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Declared Preferences */}
          {profile.preferences && (
            <div className="card-warm rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#3B1E34] pb-2 border-b border-[#E8E1D5]">
                Intentional Preferences
              </h2>

              {profile.preferences.looking_for && (
                <div>
                  <p className="text-[11px] font-semibold text-[#645C6E] uppercase tracking-wider mb-1">
                    Looking For
                  </p>
                  <p className="text-xs text-[#1F1A24] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E1D5]">
                    &ldquo;{profile.preferences.looking_for}&rdquo;
                  </p>
                </div>
              )}

              {profile.preferences.communication_style && (
                <div>
                  <p className="text-[11px] font-semibold text-[#645C6E] uppercase tracking-wider mb-1">
                    Communication Style
                  </p>
                  <p className="text-xs text-[#1F1A24] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E1D5]">
                    &ldquo;{profile.preferences.communication_style}&rdquo;
                  </p>
                </div>
              )}

              {profile.preferences.dealbreaker && (
                <div>
                  <p className="text-[11px] font-semibold text-[#D07086] uppercase tracking-wider mb-1">
                    Personal Boundary / Dealbreaker
                  </p>
                  <p className="text-xs text-[#1F1A24] bg-[#FDF2F4] p-3 rounded-xl border border-[#FCDAE1]">
                    &ldquo;{profile.preferences.dealbreaker}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#645C6E]">
          <div className="w-8 h-8 rounded-full border-2 border-[#3B1E34] border-t-transparent animate-spin mx-auto mb-3" />
          <p>Loading profile...</p>
        </div>
      }
    >
      <ProfileDetailInner />
    </Suspense>
  );
}
