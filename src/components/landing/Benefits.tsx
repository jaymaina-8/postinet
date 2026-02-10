/**
 * Key benefits: 4 bullets only, MVP value. No AI, no analytics, no templates.
 */
export function Benefits() {
  const items = [
    "One place to manage posting",
    "Scheduling that actually posts on time",
    "Retry + failure visibility",
    "Built for creators, not teams",
  ];

  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-10">
          Why Postinet AI
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {items.map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-sm sm:text-base">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
