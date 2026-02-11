/**
 * How it works: 3 steps — Connect, Upload, Schedule. Peace of mind framing.
 */
export function HowItWorks() {
  const steps = [
    {
      title: "Connect your accounts",
      body: "Link your Facebook Page and YouTube channel once. We keep them secure and ready to publish.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.172 1.172a4 4 0 01-5.656 0L11.29 8.29" />
        </svg>
      ),
    },
    {
      title: "Upload once",
      body: "Add your video or image in one place. No re-uploading per platform—we handle the rest.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        </svg>
      ),
    },
    {
      title: "Schedule or post now",
      body: "Pick a time or hit publish. We deliver on time, every time. You get clarity—scheduled, published, or needs attention.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20 px-4 border-t border-white/5">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Your posting process — simplified
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10 sm:mb-12 text-sm sm:text-base">
          Set it once. We take care of the rest so you can focus on creating.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/[0.02] border border-white/5 p-6 sm:p-8 text-center sm:text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto sm:mx-0 mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
