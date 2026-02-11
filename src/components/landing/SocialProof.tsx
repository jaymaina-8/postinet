"use client";

/**
 * "Used by creators and businesses" — two infinite-scroll marquees (creators + companies).
 * CSS-only, no Swiper. Replace placeholder data with real logos/names when available.
 */

const CREATORS = [
  { name: "Creators", stat: "Post on schedule", icon: "👤" },
  { name: "Small business", stat: "Stay consistent", icon: "🏢" },
  { name: "Marketers", stat: "One place to publish", icon: "📣" },
  { name: "Content teams", stat: "Upload once", icon: "✨" },
  { name: "YouTubers", stat: "Facebook + YouTube", icon: "▶️" },
  { name: "Page admins", stat: "No more missed posts", icon: "📄" },
];

const COMPANIES = [
  { label: "Facebook", logo: "fb" },
  { label: "YouTube", logo: "yt" },
  { label: "Creators", logo: "creator" },
  { label: "Businesses", logo: "biz" },
  { label: "Postinet", logo: "postinet" },
  { label: "Scheduling", logo: "cal" },
];

function CreatorSlide({ name, stat, icon }: { name: string; stat: string; icon: string }) {
  return (
    <div className="flex shrink-0 w-[180px] sm:w-[200px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-700 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-white text-sm truncate">{name}</div>
        <div className="text-xs text-zinc-400 truncate">{stat}</div>
      </div>
    </div>
  );
}

function CompanySlide({ label, logo }: { label: string; logo: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center w-[120px] sm:w-[134px] h-12 rounded-lg bg-zinc-800/60 px-3">
      <span className="text-xs font-medium text-zinc-400 truncate">{label}</span>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Used by creators and businesses
        </h2>

        <div className="relative">
          {/* Creators marquee — scrolls left */}
          <div className="overflow-hidden mb-8" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
            <div
              className="flex gap-4 w-max"
              style={{ animation: "marquee-creators 35s linear infinite" }}
            >
              {[...CREATORS, ...CREATORS].map((c, i) => (
                <CreatorSlide key={`c-${i}`} name={c.name} stat={c.stat} icon={c.icon} />
              ))}
            </div>
          </div>

          {/* Companies marquee — scrolls right */}
          <div className="overflow-hidden" style={{ maskImage: "linear-gradient(to left, transparent, black 8%, black 92%, transparent)" }}>
            <div
              className="flex gap-6 w-max"
              style={{ animation: "marquee-companies 40s linear infinite" }}
            >
              {[...COMPANIES, ...COMPANIES].map((c, i) => (
                <CompanySlide key={`b-${i}`} label={c.label} logo={c.logo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
