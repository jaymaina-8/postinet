/**
 * Trust: "Posting you can trust" — human-readable reliability bullets.
 */
export function Reliability() {
  const items = [
    "No duplicate posts — we only publish once per schedule",
    "Clear status: scheduled, published, or needs attention",
    "Automatic retries where safe",
  ];

  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-10">
          Posting you can trust
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {items.map((text, i) => (
            <li key={i} className="text-center sm:text-left text-sm text-zinc-400 leading-relaxed">
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
