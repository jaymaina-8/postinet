/**
 * Platform constants and types
 * Centralized platform definitions for the application
 */

export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  YOUTUBE: 'youtube',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

export const PLATFORM_LABELS: Record<Platform, string> = {
  [PLATFORMS.INSTAGRAM]: 'Instagram',
  [PLATFORMS.FACEBOOK]: 'Facebook',
  [PLATFORMS.YOUTUBE]: 'YouTube',
};

export const PLATFORM_LIST: Array<{ label: string; value: Platform }> = [
  { label: PLATFORM_LABELS[PLATFORMS.INSTAGRAM], value: PLATFORMS.INSTAGRAM },
  { label: PLATFORM_LABELS[PLATFORMS.FACEBOOK], value: PLATFORMS.FACEBOOK },
  { label: PLATFORM_LABELS[PLATFORMS.YOUTUBE], value: PLATFORMS.YOUTUBE },
];

/**
 * Check if a platform string is valid
 */
export function isValidPlatform(platform: string): platform is Platform {
  return Object.values(PLATFORMS).includes(platform as Platform);
}























