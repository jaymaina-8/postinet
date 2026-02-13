/**
 * Why Postinet: peace-of-mind benefits as cards.
 */
const BENEFITS = [
  {
    title: "Never miss a post",
    description: "Schedule in advance and we publish on time. Set it and forget it.",
  },
  {
    title: "One place for all your content",
    description: "Upload once, publish to Facebook and YouTube from a single dashboard.",
  },
  {
    title: "Clear status for every post",
    description: "See what’s scheduled, published, or needs attention at a glance.",
  },
  {
    title: "Built for creators",
    description: "Simple, reliable, no duplicate posts. Just peace of mind.",
  },
];

export function Benefits() {
  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Why creators choose Postinet AI
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10 sm:mb-12 text-sm">
          Less stress. More consistency. Posting you can actually trust.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {BENEFITS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 text-left hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
