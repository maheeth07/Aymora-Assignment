"use client";

import { useState } from "react";
import Link from "next/link";
import { MatchItem, InterestResponse } from "@/types";
import { Heart, Sparkles, MapPin, Briefcase, ExternalLink, ShieldCheck, Check } from "lucide-react";
import { api } from "@/lib/api";

interface MatchCardProps {
  match: MatchItem;
  currentUserId?: string;
  onInterestExpressed?: (result: InterestResponse, partnerName: string) => void;
  isLiked?: boolean;
}

export function MatchCard({
  match,
  currentUserId = "user-00",
  onInterestExpressed,
  isLiked = false,
}: MatchCardProps) {
  const { profile, compatibility_score, shared_interests, explanation, status } = match;
  const [liked, setLiked] = useState(isLiked);
  const [loading, setLoading] = useState(false);

  const handleHeartClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.expressInterest({
        from_user_id: currentUserId,
        to_user_id: profile.id,
      });
      setLiked(true);
      if (onInterestExpressed) {
        onInterestExpressed(res, profile.name);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to record interest.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeClass = () => {
    if (compatibility_score >= 50) return "bg-[#ECFDF3] text-[#2E7D58] border-[#C4EED8]";
    if (compatibility_score >= 25) return "bg-[#FAF4FF] text-[#3B1E34] border-[#EAE3F7]";
    return "bg-[#F5F1FD] text-[#645C6E] border-[#E8E1D5]";
  };

  return (
    <div className="card-warm rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Profile Image & Badges */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#FAF7F2]">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          {/* Compatibility Score Tag */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md border ${getScoreBadgeClass()}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{compatibility_score.toFixed(0)}% Compatibility</span>
            </span>
          </div>

          {/* Identity Info inside Image Gradient */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-baseline gap-2">
              <h3 className="font-serif text-2xl font-bold">{profile.name}</h3>
              <span className="text-base text-white/90 font-medium">{profile.age}</span>
              {profile.pronouns && (
                <span className="text-xs text-white/70 italic">({profile.pronouns})</span>
              )}
            </div>
            {profile.occupation && (
              <p className="text-xs text-white/90 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-white/75" />
                <span>{profile.occupation}</span>
              </p>
            )}
            {profile.location && (
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-white/75" />
                <span>{profile.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Bio */}
          <p className="text-xs sm:text-sm text-[#645C6E] leading-relaxed line-clamp-2">
            &ldquo;{profile.bio}&rdquo;
          </p>

          {/* Shared Interests Highlights */}
          {shared_interests.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#3B1E34] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D07086]" />
                <span>Shared Grounds ({shared_interests.length})</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shared_interests.map((interest) => (
                  <span
                    key={interest}
                    className="badge-tag badge-shared text-[11px]"
                  >
                    ★ {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other Interests */}
          {match.unique_candidate_interests.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#645C6E] uppercase tracking-wider mb-1">
                Also explores
              </p>
              <div className="flex flex-wrap gap-1">
                {match.unique_candidate_interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="badge-tag badge-lavender text-[10px]"
                  >
                    {interest}
                  </span>
                ))}
                {match.unique_candidate_interests.length > 3 && (
                  <span className="text-[10px] text-[#9B94A4] self-center">
                    +{match.unique_candidate_interests.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Transparent Compatibility Rationale */}
          <div className="rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] p-3 text-xs text-[#645C6E]">
            <p className="font-semibold text-[#3B1E34] text-[11px] mb-1 flex items-center gap-1">
              <span>Why you match</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-white border border-[#E8E1D5]">
                Jaccard {status}
              </span>
            </p>
            <p className="text-[11px] leading-relaxed text-[#645C6E]">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-[#E8E1D5]/50 flex items-center justify-between gap-2 mt-2">
        <Link
          href={`/profile/${profile.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#3B1E34] hover:bg-[#F3EEF9] transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Private Express Interest Button */}
        <button
          onClick={handleHeartClick}
          disabled={loading || liked}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            liked
              ? "bg-[#FDF2F4] text-[#D07086] border border-[#FCDAE1] cursor-default"
              : "bg-[#3B1E34] text-white hover:bg-[#4D2945] active:scale-95"
          }`}
          title="Express interest privately. Only revealed if mutual."
        >
          {liked ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#D07086]" />
              <span>Interest Expressed</span>
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>{loading ? "Recording..." : "Express Interest"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
