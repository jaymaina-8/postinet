/**
 * Trust / reliability — brand story: built so creators never have to wonder.
 */
export function Reliability() {
  const items = [
    "No duplicate posts — we publish once per schedule, exactly as you set it",
    "Clear status for every post: scheduled, published, or needs attention",
    "Automatic retries when safe, so your content gets out even when things hiccup",
  ];

  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Built so you never have to wonder
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-8 sm:mb-10 text-sm">
          We built Postinet so you can stop worrying about whether your posts went out.
        </p>
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
