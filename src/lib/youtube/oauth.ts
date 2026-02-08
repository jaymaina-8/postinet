/**
 * YouTube OAuth helper functions
 * Web Application OAuth flow, server-side code exchange with client_secret;
 * redirect URI must match Google Console exactly.
 */

/**
 * Validate that all required YouTube OAuth environment variables are set
 * @throws Error if any required environment variable is missing
 */
export function validateYouTubeEnv(): void {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const missing: string[] = [];

  if (!clientId) {
    missing.push('GOOGLE_CLIENT_ID');
  }

  if (!clientSecret) {
    missing.push('GOOGLE_CLIENT_SECRET');
  }

  if (!appUrl) {
    missing.push('NEXT_PUBLIC_APP_URL');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required YouTube OAuth environment variables: ${missing.join(', ')}. ` +
      `Please add them to your .env.local file.`
    );
  }
}

export interface YouTubeTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface YouTubeErrorResponse {
  error: string;
  error_description?: string;
}


/**
 * Required scopes for YouTube API
 */
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

/**
 * Generate YouTube OAuth authorization URL
 * @param redirectUri - The callback URL where Google will redirect after authorization
 * @returns YouTube OAuth authorization URL
 */
export function getYouTubeAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
  }

  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code from Google OAuth callback
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns Token response with access_token, refresh_token, and expires_in
 * @throws Error if token exchange fails
 */
/**
 * Fetch YouTube user profile information
 * @param accessToken - The access token to use for authentication
 * @returns Profile data including id, name, and picture
 * @throws Error if profile fetch fails
 */








