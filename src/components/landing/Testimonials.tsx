"use client";

const TESTIMONIALS = [
  {
    quote:
      "Postinet has been crucial in helping me stay consistent. I schedule a week at a time and never miss a post. It's a no-brainer for anyone juggling multiple platforms.",
    author: "Sarah M.",
    role: "Content creator",
    photo: "https://i.pravatar.cc/100?img=1",
  },
  {
    quote:
      "Upload once, publish to Facebook and YouTube from one place. Finally. No more copying and pasting or forgetting one platform.",
    author: "Marcus T.",
    role: "Small business owner",
    photo: "https://i.pravatar.cc/100?img=12",
  },
  {
    quote:
      "We love the reach of multiple channels but hated the chaos. Postinet brought the cost of staying active way down. Set it and forget it.",
    author: "Jordan L.",
    role: "Marketing lead",
    photo: "https://i.pravatar.cc/100?img=5",
  },
  {
    quote:
      "It used to take me an hour to get one post on both platforms. Now it takes minutes. The clarity on what's scheduled and what's live is everything.",
    author: "Alex K.",
    role: "Creator",
    photo: "https://i.pravatar.cc/100?img=9",
  },
  {
    quote:
      "The only scheduling tool that actually feels built for creators. Simple, reliable, no duplicate posts. I'm a super fan.",
    author: "Riley C.",
    role: "YouTuber",
    photo: "https://i.pravatar.cc/100?img=16",
  },
];

function TestimonialCard({
  quote,
  author,
  role,
  photo,
}: {
  quote: string;
  author: string;
  role: string;
  photo: string;
}) {
  return (
    <div className="flex-shrink-0 w-[min(320px,85vw)] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 flex flex-col min-h-[200px] hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors">
      <p className="text-sm sm:text-base text-zinc-200 leading-relaxed flex-1 mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center justify-between gap-3 mt-auto">
        <div>
          <p className="text-sm font-semibold text-white">{author}</p>
          <p className="text-xs text-zinc-500">{role}</p>
        </div>
        <img
          src={photo}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-700"
        />
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-14 sm:py-20 px-4 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          A partner to your growth
        </h2>
        <p className="text-zinc-400 text-center max-w-xl mx-auto mb-10 sm:mb-12 text-sm">
          The only AI-powered scheduler that actually drives consistency. Just ask creators who use it.
        </p>

        <div className="relative -mx-4 sm:-mx-6 overflow-hidden">
          <div className="flex w-max gap-4 sm:gap-5 animate-testimonial-marquee">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard
                key={`${t.author}-${i}`}
                quote={t.quote}
                author={t.author}
                role={t.role}
                photo={t.photo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
