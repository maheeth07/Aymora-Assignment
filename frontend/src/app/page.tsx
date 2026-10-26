import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Compass,
  MessageCircleHeart,
  Gamepad2,
  Heart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAE3F7]/70 border border-[#EAE3F7] text-xs font-semibold text-[#3B1E34] mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D07086]" />
          <span>A New Philosophy for Meaningful Dating</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#3B1E34] tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Discover compatibility with{" "}
          <span className="italic font-normal text-[#D07086]">clarity</span> and{" "}
          <span className="italic font-normal text-[#3B1E34]">genuine intention</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#645C6E] max-w-2xl mx-auto leading-relaxed">
          No endless swiping. No public vanity metrics. Aymora Spark pairs
          transparent compatibility logic, private mutual interest, and thoughtful AI conversation
          coaching to help real connections blossom.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#3B1E34] text-white font-medium text-sm hover:bg-[#4D2945] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>Explore Smart Matches</span>
            <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
          </Link>
          <Link
            href="/games/would-you-rather"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#E8E1D5] text-[#3B1E34] font-medium text-sm hover:bg-[#F5F1FD] transition-all shadow-sm"
          >
            <Gamepad2 className="w-4 h-4 text-[#D07086]" />
            <span>Play &quot;Would You Rather?&quot;</span>
          </Link>
        </div>

        {/* Prototype User Banner */}
        <div className="mt-10 inline-flex items-center gap-3 p-2.5 sm:px-4 rounded-2xl bg-white/80 border border-[#E8E1D5] text-xs text-[#645C6E] shadow-sm">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#D07086]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Maya Lin"
              className="w-full h-full object-cover"
            />
          </div>
          <span>
            Logged in as <strong className="text-[#1F1A24]">Maya Lin</strong> (26, Architectural Designer)
          </span>
          <span className="hidden sm:inline text-[#E8E1D5]">|</span>
          <span className="hidden sm:inline text-[#2E7D58] font-medium">16 Curated Profiles Ready</span>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12 border-t border-[#E8E1D5]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B1E34]">
            Crafted for intentional connection
          </h2>
          <p className="mt-2 text-sm text-[#645C6E]">
            How Aymora Spark replaces addictive mechanics with thoughtful human design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="card-warm rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FAF4FF] border border-[#EAE3F7] flex items-center justify-center text-[#3B1E34] mb-4">
                <Compass className="w-5 h-5 text-[#3B1E34]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#3B1E34]">
                Deterministic Compatibility
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-[#645C6E] leading-relaxed">
                We calculate compatibility using mathematically transparent Jaccard similarity.
                Every match score is accompanied by an honest, human explanation of exactly why you may connect.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5]/60 flex items-center gap-2 text-xs font-medium text-[#2E7D58]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero black-box scores</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card-warm rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] border border-[#FCDAE1] flex items-center justify-center text-[#D07086] mb-4">
                <Heart className="w-5 h-5 text-[#D07086]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#3B1E34]">
                Radical Private Interest
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-[#645C6E] leading-relaxed">
                Expressing interest is strictly private. Conversations only unlock when both individuals
                have reciprocated interest. No public like counts, no vanity popularity contests.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5]/60 flex items-center gap-2 text-xs font-medium text-[#2E7D58]">
              <ShieldCheck className="w-4 h-4" />
              <span>Double-blind mutual connection</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card-warm rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FAF4FF] border border-[#EAE3F7] flex items-center justify-center text-[#3B1E34] mb-4">
                <Sparkles className="w-5 h-5 text-[#D07086]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#3B1E34]">
                Groq AI Companion
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-[#645C6E] leading-relaxed">
                Stuck on how to break the ice? Our AI assistant analyzes shared interests to suggest
                three natural openers in Funny, Flirty, and Sweet tones. You always review, edit, and send manually.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E1D5]/60 flex items-center gap-2 text-xs font-medium text-[#2E7D58]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Human in the loop, always</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Experience Banner */}
      <section className="w-full max-w-5xl mx-auto px-4 py-8 mb-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#3B1E34] to-[#4D2945] p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-xl relative z-10">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#D07086] px-2.5 py-1 rounded bg-white/10">
              Interactive Icebreaker
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-3 leading-snug">
              Spark effortless conversation with &quot;Would You Rather?&quot;
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-[#EAE3F7]/90 leading-relaxed">
              Explore 16 thoughtfully curated dilemmas exploring travel rhythms, sensory luxuries, and creative dreams.
              A pressure-free way to explore mutual values and spark real banter.
            </p>
            <div className="mt-6">
              <Link
                href="/games/would-you-rather"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF7F2] text-[#3B1E34] text-xs sm:text-sm font-semibold hover:bg-white transition-colors"
              >
                <Gamepad2 className="w-4 h-4 text-[#D07086]" />
                <span>Play the Game Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
