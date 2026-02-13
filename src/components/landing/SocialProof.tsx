"use client";

/**
 * "Used by 12M+ creators and businesses" — creator avatars with follower counts
 * and platform badges, business logos row. Animations + real-photo style.
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type PlatformBadge = "youtube" | "tiktok" | "linkedin";

const CREATORS = [
  { name: "Sarah M.", followers: "54.4K", platform: "linkedin" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=1" },
  { name: "Marcus T.", followers: "422K", platform: "tiktok" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=12" },
  { name: "Jordan L.", followers: "1.5M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=5" },
  { name: "Mai P.", followers: "3.3M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=9" },
  { name: "Alex K.", followers: "5.3M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=16" },
  { name: "Riley C.", followers: "9.79M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=33" },
  { name: "Tom B.", followers: "4.5M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=44" },
  { name: "Drew H.", followers: "5.08M", platform: "youtube" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=52" },
  { name: "Sam R.", followers: "65.9M", platform: "tiktok" as PlatformBadge, photo: "https://i.pravatar.cc/200?img=68" },
];

/* Add logo: "https://..." for real logo images; otherwise shows name text */
const BUSINESSES = [
  { name: "GitHub" },
  { name: "iHeartMedia" },
  { name: "VISA" },
  { name: "Audacy" },
  { name: "Univision" },
  { name: "Chili Piper" },
  { name: "Memphis Grizzlies" },
  { name: "ZoomInfo" },
  { name: "Telefónica" },
  { name: "NVIDIA" },
] as const;

function PlatformIconSmall({ platform }: { platform: PlatformBadge }) {
  const size = 14;
  const className = "absolute bottom-0 right-0 rounded-full border border-zinc-900 bg-zinc-800 p-0.5";
  if (platform === "youtube") {
    return (
      <span className={className} aria-hidden>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </span>
    );
  }
  if (platform === "tiktok") {
    return (
      <span className={className} aria-hidden>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      </span>
    );
  }
  return (
    <span className={className} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#0a66c2]">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </span>
  );
}

function CreatorSlide({
  name,
  followers,
  platform,
  photo,
  reduceMotion,
}: {
  name: string;
  followers: string;
  platform: PlatformBadge;
  photo: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      className="flex shrink-0 w-[100px] sm:w-[110px] group"
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.03, transition: { duration: 0.2 } }}
      transition={{ type: "tween", duration: 0.25 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-2 ring-zinc-700/80 ring-offset-2 ring-offset-[#0a0a0a] mb-2 transition-all duration-300 group-hover:ring-emerald-500/40 group-hover:scale-105">
          <img
            src={photo}
            alt=""
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
          <PlatformIconSmall platform={platform} />
        </div>
        <p className="font-semibold text-white text-xs sm:text-sm truncate w-full">{name}</p>
        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">{followers} followers</p>
      </div>
    </motion.div>
  );
}

function BusinessSlide({
  name,
  reduceMotion,
}: {
  name: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      className="flex shrink-0 group"
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.05, transition: { duration: 0.2 } }}
      transition={{ type: "tween", duration: 0.25 }}
    >
      <div className="flex items-center justify-center w-[100px] sm:w-[110px] h-12 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 transition-all duration-300 group-hover:border-zinc-600 group-hover:bg-zinc-800/60">
        <span className="text-zinc-300 text-xs sm:text-sm font-semibold truncate w-full text-center">
          {name}
        </span>
      </div>
    </motion.div>
  );
}

export function SocialProof() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className="py-14 sm:py-20 px-4 border-t border-white/5 overflow-hidden"
    >
      <div className="mx-auto max-w-[1100px]">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView && !reduceMotion ? { opacity: 1, y: 0 } : reduceMotion ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Used by 12M+ creators and businesses
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
            From solo creators to global brands — schedule once and post everywhere.
          </p>
        </motion.div>

        <div className="relative">
          {/* Creators row — circular avatars, name, followers, platform badge */}
          <div
            className="overflow-hidden mb-8 sm:mb-10 marquee-pause-on-hover"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <div
              className="flex gap-6 sm:gap-8 w-max marquee-track-creators"
              style={{ animation: "marquee-creators 50s linear infinite" }}
            >
              {[...CREATORS, ...CREATORS].map((c, i) => (
                <CreatorSlide
                  key={`c-${i}`}
                  name={c.name}
                  followers={c.followers}
                  platform={c.platform}
                  photo={c.photo}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>

          {/* Businesses row — logo-style tiles */}
          <div
            className="overflow-hidden marquee-pause-on-hover"
            style={{
              maskImage: "linear-gradient(to left, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <div
              className="flex gap-4 sm:gap-5 w-max marquee-track-companies"
              style={{ animation: "marquee-companies 55s linear infinite" }}
            >
              {[...BUSINESSES, ...BUSINESSES].map((b, i) => (
                <BusinessSlide key={`b-${i}`} name={b.name} reduceMotion={reduceMotion} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
