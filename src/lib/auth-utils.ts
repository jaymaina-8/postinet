/**
 * APP_URL: Used for OAuth redirects. Must be set in production.
 * - In prod: should be https://postinet.pro (warn if not)
 * - Dev: defaults to http://localhost:3000
 */
export const APP_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")) ??
  "http://localhost:3000";

const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";

/**
 * Returns the redirect URL for OAuth callbacks.
 * In production, warns if APP_URL is missing or not HTTPS.
 */
export function getRedirectUrl(path: string = "/auth/callback"): string {
  const base = APP_URL;
  if (isProd) {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error(
        "[auth] NEXT_PUBLIC_APP_URL is missing in production. OAuth redirects may fail."
      );
    } else if (!base.startsWith("https://")) {
      console.error(
        "[auth] NEXT_PUBLIC_APP_URL should use HTTPS in production:",
        base
      );
    }
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Whether Google OAuth should be disabled (e.g. missing APP_URL in prod).
 */
export function isGoogleOAuthDisabled(): boolean {
  return isProd && !process.env.NEXT_PUBLIC_APP_URL;
}
