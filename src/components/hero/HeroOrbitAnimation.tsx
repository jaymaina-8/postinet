"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  DEFAULT_PLATFORMS,
  FLOATING_CARD_POSITIONS,
  FLOATING_CARD_COUNTS,
  ORBIT_ANGLES_6,
  ORBIT_ANGLES_4,
  RADII,
  type PlatformItem,
} from "./orbitConfig";
import { PlatformIcon } from "./PlatformIcon";

const CANVAS_SIZE = 400;
const CENTER = CANVAS_SIZE / 2;

/** Round to 2 decimals for stable SSR/client hydration (no float drift). */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function polarToXY(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: r2(CENTER + radius * Math.cos(rad)),
    y: r2(CENTER - radius * Math.sin(rad)),
  };
}

/** Quadratic Bezier path; coordinates rounded for hydration-safe output. */
function curvedPathFromCenter(
  cx: number,
  cy: number,
  endX: number,
  endY: number,
  bend: number
) {
  const midX = (cx + endX) / 2;
  const midY = (cy + endY) / 2;
  const dx = endX - cx;
  const dy = endY - cy;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = (-dy / len) * bend;
  const perpY = (dx / len) * bend;
  const cpx = r2(midX + perpX);
  const cpy = r2(midY + perpY);
  return `M ${r2(cx)} ${r2(cy)} Q ${cpx} ${cpy} ${r2(endX)} ${r2(endY)}`;
}

export interface HeroOrbitAnimationProps {
  variant?: "light" | "dark";
  platforms?: PlatformItem[];
}

const floatingCardMessages = [
  "Schedule once",
  "Post everywhere",
  "Save time",
  "Stay consistent",
  "Grow faster",
];

/** Hexagon path; rounded for hydration-safe output. */
function hexagonPath(r: number) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180);
    return `${r2(r * Math.cos(a))},${r2(r * Math.sin(a))}`;
  });
  return `M ${points.join(" L ")} Z`;
}

export function HeroOrbitAnimation({
  variant = "dark",
  platforms = DEFAULT_PLATFORMS,
}: HeroOrbitAnimationProps) {
  const reduceMotion = useReducedMotion();
  const [radius, setRadius] = useState<number>(RADII.desktop);
  const [nodeCount, setNodeCount] = useState(6);
  const [cardCount, setCardCount] = useState<number>(FLOATING_CARD_COUNTS.desktop);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 640) {
        setRadius(RADII.mobile);
        setNodeCount(4);
        setCardCount(FLOATING_CARD_COUNTS.mobile);
      } else if (w < 1024) {
        setRadius(RADII.tablet);
        setNodeCount(6);
        setCardCount(FLOATING_CARD_COUNTS.tablet);
      } else {
        setRadius(RADII.desktop);
        setNodeCount(6);
        setCardCount(FLOATING_CARD_COUNTS.desktop);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || nodeCount < 6) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: x * 10, y: y * 10 });
    },
    [reduceMotion, nodeCount]
  );
  const handleMouseLeave = useCallback(() => setParallax({ x: 0, y: 0 }), []);

  const angles = nodeCount === 4 ? ORBIT_ANGLES_4 : ORBIT_ANGLES_6;
  const displayPlatforms = platforms.slice(0, nodeCount);
  const nodePositions = useMemo(
    () => angles.map((angle) => polarToXY(angle, radius)),
    [angles, radius]
  );

  const curvedPaths = useMemo(
    () =>
      nodePositions.map((pos) =>
        curvedPathFromCenter(CENTER, CENTER, pos.x, pos.y, 28)
      ),
    [nodePositions]
  );

  const isDark = variant === "dark";

  return (
    <div
      className="relative w-full max-w-[380px] sm:max-w-[420px] md:max-w-[520px] mx-auto h-[320px] sm:h-[380px] md:h-[420px] lg:h-[520px] flex items-center justify-center overflow-hidden rounded-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: isDark
          ? "radial-gradient(ellipse 100% 100% at 50% 50%, #0f1729 0%, #020617 50%, #030712 100%)"
          : "radial-gradient(ellipse 100% 100% at 50% 50%, #e0e7ff 0%, #c7d2fe 40%, #a5b4fc 100%)",
        boxShadow: isDark
          ? "inset 0 0 120px rgba(16, 185, 129, 0.03), 0 0 0 1px rgba(255,255,255,0.04)"
          : "inset 0 0 80px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Constellation grain */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, white 0.5px, transparent 0.5px),
            radial-gradient(circle at 80% 70%, white 0.5px, transparent 0.5px),
            radial-gradient(circle at 50% 50%, white 0.5px, transparent 0.5px)`,
          backgroundSize: "120px 120px, 180px 180px, 90px 90px",
        }}
      />

      <motion.div
        className="relative flex items-center justify-center w-full h-full"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          maxWidth: "100%",
          maxHeight: "100%",
          transform: reduceMotion ? undefined : `translate(${parallax.x}px, ${parallax.y}px)`,
        }}
        transition={{ type: "tween", duration: 0.25 }}
      >
        {/* Curved connection paths with data-pulse */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="line-glow-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
              <stop offset="50%" stopColor="rgba(34, 211, 238, 0.4)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.25)" />
            </linearGradient>
            <linearGradient id="line-glow-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6, 95, 70, 0.4)" />
              <stop offset="50%" stopColor="rgba(14, 165, 233, 0.5)" />
              <stop offset="100%" stopColor="rgba(6, 95, 70, 0.4)" />
            </linearGradient>
            <filter id="glow-dark" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Base curved lines */}
          <g style={{ filter: isDark ? "url(#glow-dark)" : undefined }}>
            {curvedPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={isDark ? "url(#line-glow-dark)" : "url(#line-glow-light)"}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="opacity-70"
              />
            ))}
          </g>
          {/* Animated pulse along each path (when motion allowed) */}
          {!reduceMotion &&
            curvedPaths.map((d, i) => (
              <motion.path
                key={`pulse-${i}`}
                d={d}
                fill="none"
                stroke="rgba(34, 211, 238, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="8 200"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -208 }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.35,
                }}
                style={{ willChange: "stroke-dashoffset" }}
              />
            ))}
        </svg>

        {/* Orbital nodes — hex-style glass pills */}
        {displayPlatforms.map((platform, i) => {
          const pos = nodePositions[i];
          const isLink = platform.href && platform.href !== "#";
          const Wrapper = isLink ? "a" : "div";
          const nodeSize = 48;
          const offset = nodeSize / 2;
          return (
            <motion.div
              key={platform.name}
              className="absolute flex items-center justify-center"
              style={{
                left: `${r2(((pos.x - offset) / CANVAS_SIZE) * 100)}%`,
                top: `${r2(((pos.y - offset) / CANVAS_SIZE) * 100)}%`,
                width: "48px",
                height: "48px",
                willChange: reduceMotion ? "auto" : "transform",
              }}
              initial={false}
              animate={
                reduceMotion
                  ? {}
                  : {
                      y: [0, -5, 0],
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <Wrapper
                href={isLink ? platform.href : undefined}
                className={`
                  w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center
                  border backdrop-blur-sm
                  ${platform.colorClass}
                  border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]
                  hover:scale-110 hover:shadow-[0_0_24px_rgba(16,185,129,0.15)]
                  focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                  transition-all duration-200
                `}
                title={platform.name}
                aria-label={platform.name}
              >
                <PlatformIcon icon={platform.icon} />
              </Wrapper>
            </motion.div>
          );
        })}

        {/* Center: hexagon core with rotating ring */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: -40,
            marginTop: -40,
            width: 80,
            height: 80,
            willChange: reduceMotion ? "auto" : "transform",
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1, 1.06, 1],
                  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                }
          }
        >
          <svg
            viewBox="0 0 80 80"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="hex-ring-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.7)" />
                <stop offset="50%" stopColor="rgba(34, 211, 238, 0.5)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.7)" />
              </linearGradient>
              <linearGradient id="hex-ring-light" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(6, 95, 70, 0.8)" />
                <stop offset="50%" stopColor="rgba(14, 165, 233, 0.6)" />
                <stop offset="100%" stopColor="rgba(6, 95, 70, 0.8)" />
              </linearGradient>
            </defs>
            <g transform="translate(40, 40)">
              <motion.g
                initial={false}
                animate={reduceMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <path
                  d={hexagonPath(38)}
                  fill="none"
                  stroke={isDark ? "url(#hex-ring-dark)" : "url(#hex-ring-light)"}
                  strokeWidth="2.5"
                />
              </motion.g>
              <path
                d={hexagonPath(32)}
                fill={isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"}
                stroke={isDark ? "rgba(16, 185, 129, 0.35)" : "rgba(6, 95, 70, 0.4)"}
                strokeWidth="1"
              />
            </g>
          </svg>
          <span
            className="absolute font-bold text-emerald-400 tracking-tighter"
            style={{
              fontSize: "1.35rem",
              letterSpacing: "-0.04em",
              textShadow: isDark ? "0 0 24px rgba(16, 185, 129, 0.3)" : "none",
            }}
          >
            AI
          </span>
        </motion.div>

        {/* Pill bar — signal strip */}
        <motion.div
          className="absolute flex items-center justify-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: -64,
            marginTop: 36,
            width: 128,
            background: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.7)",
            borderColor: isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(6, 95, 70, 0.2)",
            willChange: "auto",
          }}
        >
          {displayPlatforms.slice(0, 4).map((p) => (
            <span key={p.name} className="opacity-90" title={p.name}>
              <PlatformIcon icon={p.icon} />
            </span>
          ))}
        </motion.div>

        {/* Floating signal cards */}
        {Array.from({ length: cardCount }).map((_, i) => (
          <FloatingCard
            key={i}
            index={i}
            message={floatingCardMessages[i % floatingCardMessages.length]}
            position={FLOATING_CARD_POSITIONS[i % FLOATING_CARD_POSITIONS.length]}
            reduceMotion={!!reduceMotion}
            isDark={isDark}
          />
        ))}
      </motion.div>
    </div>
  );
}

function FloatingCard({
  index,
  message,
  position,
  reduceMotion,
  isDark,
}: {
  index: number;
  message: string;
  position: { x: number; y: number };
  reduceMotion: boolean;
  isDark: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-full pl-3 pr-4 py-2 text-xs font-medium shadow-xl border backdrop-blur-sm pointer-events-none whitespace-nowrap flex items-center gap-2"
      style={{
        left: `${50 + position.x}%`,
        top: `${50 + position.y}%`,
        transform: "translate(-50%, -50%)",
        background: isDark
          ? "rgba(15, 23, 42, 0.85)"
          : "rgba(255, 255, 255, 0.9)",
        borderColor: isDark ? "rgba(34, 211, 238, 0.25)" : "rgba(14, 165, 233, 0.25)",
        color: isDark ? "rgb(165, 243, 252)" : "rgb(6, 78, 99)",
        willChange: reduceMotion ? "auto" : "opacity, transform",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)"
          : "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.85, y: 6 }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: [0, 1, 1, 0],
              scale: [0.85, 1, 1, 0.9],
              y: [6, 0, 0, -6],
              transition: {
                duration: 5.5,
                repeat: Infinity,
                delay: index * 1.3,
                times: [0, 0.12, 0.75, 1],
              },
            }
      }
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 shrink-0"
        style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)" }}
      />
      {message}
    </motion.div>
  );
}
