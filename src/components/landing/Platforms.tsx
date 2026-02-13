const STATS = [
  { value: "12M+", label: "Creators" },
  { value: "1M+", label: "Posts scheduled" },
  { value: "2K+", label: "Projects" },
  { value: "50+", label: "Countries" },
];

/**
 * Supported platforms: Facebook + YouTube (active). Instagram, TikTok coming soon (muted, not clickable).
 * Includes a stats strip below (creators, posts, projects, countries).
 */
export function Platforms() {
  return (
    <section id="platforms" className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-10">
          Supported platforms
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-white">Facebook</span>
            </div>
            <span className="text-xs text-zinc-500 sm:pl-0 pl-7">Connected posting + scheduling</span>
          </div>
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-sm font-medium text-white">YouTube</span>
            </div>
            <span className="text-xs text-zinc-500 sm:pl-0 pl-7">Uploads + scheduling</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-500 cursor-default" aria-hidden>
            <span className="text-sm font-medium">Instagram</span>
            <span className="text-xs text-zinc-600">Coming soon</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-500 cursor-default" aria-hidden>
            <span className="text-sm font-medium">TikTok</span>
            <span className="text-xs text-zinc-600">Coming soon</span>
          </div>
        </div>

        {/* Stats strip — large number + label per column */}
        <div className="mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{value}</div>
              <div className="mt-1 text-sm font-medium text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
