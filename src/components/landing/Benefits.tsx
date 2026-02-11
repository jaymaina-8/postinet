/**
 * Why Postinet: peace-of-mind benefits. No more worry, one place, trust.
 */
export function Benefits() {
  const items = [
    "Never miss a post — schedule in advance and we publish on time",
    "One place for all your content — upload once, publish to Facebook and YouTube",
    "Clear status for every post — scheduled, published, or needs attention",
    "Built for creators — simple, reliable, no duplicate posts",
  ];

  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Why creators choose Postinet AI
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-8 sm:mb-10 text-sm">
          Less stress. More consistency. Posting you can actually trust.
        </p>
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
