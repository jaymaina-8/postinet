"use client";

/**
 * Why Postinet — value props in card format.
 */

const CARDS = [
  {
    title: "One upload, everywhere",
    description: "Create your content once. Schedule to Facebook and YouTube from a single place and hit publish when you’re ready.",
    icon: "↑",
    accent: "emerald",
  },
  {
    title: "Stay consistent, stay you",
    description: "Keep your audience engaged without burning out. Set your calendar, and we handle the rest so you can focus on creating.",
    icon: "◇",
    accent: "emerald",
  },
  {
    title: "Simple and transparent",
    description: "See what’s scheduled, what’s live, and what needs attention. No hidden steps, no surprise duplicates.",
    icon: "◉",
    accent: "emerald",
  },
];

const accentClasses: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
};

export function Reliability() {
  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Why creators choose Postinet AI
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10 sm:mb-12 text-sm">
          Less busywork, more consistency. Schedule across platforms and get back to what you do best.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`
                relative rounded-2xl border p-5 sm:p-6 text-left
                transition-all duration-300 hover:border-white/15 hover:shadow-lg hover:shadow-black/20
                ${accentClasses[card.accent]}
              `}
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-black/20 text-lg font-medium"
                  aria-hidden
                >
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-base mb-1.5">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
