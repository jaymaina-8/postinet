/**
 * Hero Orbit Animation — platform definitions and layout constants.
 * Radii in px; polar angles in degrees (0 = right, 90 = bottom).
 */

export interface PlatformItem {
  name: string;
  icon: "tiktok" | "youtube" | "instagram" | "linkedin" | "facebook" | "x";
  colorClass: string;
  href?: string;
}

/** 6 platforms for desktop/tablet; mobile uses first 4. */
export const DEFAULT_PLATFORMS: PlatformItem[] = [
  { name: "TikTok", icon: "tiktok", colorClass: "text-zinc-100 bg-zinc-800/80", href: "#" },
  { name: "YouTube", icon: "youtube", colorClass: "text-red-400 bg-red-500/10", href: "#" },
  { name: "Instagram", icon: "instagram", colorClass: "text-pink-400 bg-pink-500/10", href: "#" },
  { name: "LinkedIn", icon: "linkedin", colorClass: "text-blue-400 bg-blue-500/10", href: "#" },
  { name: "Facebook", icon: "facebook", colorClass: "text-blue-500 bg-blue-500/10", href: "#" },
  { name: "X", icon: "x", colorClass: "text-zinc-300 bg-zinc-700/80", href: "#" },
];

/** Polar angle (degrees) for each of 6 positions. Evenly spaced: 0, 60, 120, 180, 240, 300. */
export const ORBIT_ANGLES_6 = [0, 60, 120, 180, 240, 300];

/** For mobile we use 4 nodes at 0, 90, 180, 270. */
export const ORBIT_ANGLES_4 = [0, 90, 180, 270];

export const RADII = {
  desktop: 180,
  tablet: 140,
  mobile: 110,
} as const;

/** Floating card positions (relative to center): percentage offsets. */
export const FLOATING_CARD_POSITIONS = [
  { x: 18, y: -12 },   // top-right
  { x: 22, y: 8 },    // right
  { x: -20, y: 10 },  // bottom-left
  { x: -18, y: -8 },  // top-left
  { x: 10, y: -22 },  // top
] as const;

/** Number of floating cards by breakpoint. */
export const FLOATING_CARD_COUNTS = {
  desktop: 5,
  tablet: 3,
  mobile: 1,
} as const;
