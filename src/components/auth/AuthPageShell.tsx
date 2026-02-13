"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const ROTATION_INTERVAL_MS = 5000;

export const AUTH_TESTIMONIES = [
  { quote: "Postinet has been crucial in helping me stay consistent. I schedule a week at a time and never miss a post.", authorHandle: "Sarah M. · Content creator", authorAvatar: "https://i.pravatar.cc/200?img=1" },
  { quote: "Upload once, publish to Facebook and YouTube from one place. Finally. No more copying and pasting or forgetting one platform.", authorHandle: "Marcus T. · Small business owner", authorAvatar: "https://i.pravatar.cc/200?img=12" },
  { quote: "We love the reach of multiple channels but hated the chaos. Postinet brought the cost of staying active way down. Set it and forget it.", authorHandle: "Jordan L. · Marketing lead", authorAvatar: "https://i.pravatar.cc/200?img=5" },
  { quote: "It used to take me an hour to get one post on both platforms. Now it takes minutes. The clarity on what's scheduled and what's live is everything.", authorHandle: "Alex K. · Creator", authorAvatar: "https://i.pravatar.cc/200?img=9" },
  { quote: "The only scheduling tool that actually feels built for creators. Simple, reliable, no duplicate posts. I'm a super fan.", authorHandle: "Riley C. · YouTuber", authorAvatar: "https://i.pravatar.cc/200?img=16" },
  { quote: "Where has Postinet been all my life? Scheduling and publishing in one place — finally.", authorHandle: "Sam R. · Page admin", authorAvatar: "https://i.pravatar.cc/200?img=33" },
  { quote: "Very impressed by Postinet's growth. For new creators and small teams, they've gone from 'promising' to 'standard' in remarkably short order.", authorHandle: "Drew H. · Content lead", authorAvatar: "https://i.pravatar.cc/200?img=44" },
  { quote: "One upload, all platforms. No more duplicate work or missed posts. This is how social scheduling should work.", authorHandle: "Maya P. · Marketer", authorAvatar: "https://i.pravatar.cc/200?img=47" },
  { quote: "I used to forget to post on one channel every time. Postinet keeps everything in sync. Game changer.", authorHandle: "Chris T. · YouTuber", authorAvatar: "https://i.pravatar.cc/200?img=52" },
  { quote: "Set it and forget it. My Facebook and YouTube are always updated now. Worth every penny.", authorHandle: "Jamie L. · Creator", authorAvatar: "https://i.pravatar.cc/200?img=68" },
];

type AuthPageShellProps = {
  children: React.ReactNode;
  quote?: string;
  authorHandle?: string;
  authorAvatar?: string;
  /** When provided, rotates through these testimonies every 5 seconds. Overrides quote/authorHandle/authorAvatar. */
  testimonies?: Array<{ quote: string; authorHandle: string; authorAvatar?: string }>;
};

export function AuthPageShell({
  children,
  quote: quoteProp = "",
  authorHandle: authorHandleProp = "",
  authorAvatar: authorAvatarProp,
  testimonies = AUTH_TESTIMONIES,
}: AuthPageShellProps) {
  const [index, setIndex] = useState(0);
  const hasTestimonies = Array.isArray(testimonies) && testimonies.length > 0;

  useEffect(() => {
    if (!hasTestimonies) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonies.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasTestimonies, testimonies.length]);

  const current = hasTestimonies ? testimonies[index] : null;
  const quote = current?.quote ?? quoteProp;
  const authorHandle = current?.authorHandle ?? authorHandleProp;
  const authorAvatar = current?.authorAvatar ?? authorAvatarProp;

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:max-w-[480px] lg:mx-auto lg:flex-none">
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">
              <Logo showName />
            </Link>
            <Link
              href="/dashboard/help"
              className="text-sm text-zinc-400 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <BookIcon className="w-4 h-4" />
              Documentation
            </Link>
          </div>
          {children}
        </div>
        <p className="text-xs text-zinc-500 mt-8">
          By continuing, you agree to Postinet&apos;s{" "}
          <Link href="/terms" className="text-zinc-400 hover:text-zinc-300 underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-zinc-400 hover:text-zinc-300 underline">Privacy Policy</Link>
          , and to receive periodic emails with updates.
        </p>
      </div>

      {/* Right: testimonial — hidden on small screens, rotates every 5s when testimonies provided */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-zinc-900/50 border-l border-zinc-800/50 p-12">
        <div className="max-w-md">
          {quote ? (
            <>
              <span className="text-6xl text-zinc-600 font-serif leading-none select-none">&ldquo;</span>
              <blockquote className="text-xl sm:text-2xl text-zinc-200 font-medium -mt-4 transition-opacity duration-500">
                {quote}
              </blockquote>
              <div className="flex items-center gap-3 mt-6">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full bg-zinc-700 object-cover shrink-0" />
                ) : authorHandle ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-semibold shrink-0">
                    {authorHandle.charAt(0).toUpperCase()}
                  </div>
                ) : null}
                {authorHandle ? <span className="text-zinc-400">{authorHandle}</span> : null}
              </div>
            </>
          ) : (
            <div className="text-zinc-500 text-sm">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
