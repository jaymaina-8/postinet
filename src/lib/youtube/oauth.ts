/**
 * YouTube OAuth helper functions
 * Handles OAuth URL generation and token exchange
 */

/**
 * Validate that all required YouTube OAuth environment variables are set
 * @throws Error if any required environment variable is missing
 */
export function validateYouTubeEnv(): void {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  const missing: string[] = [];

  if (!clientId) {
    missing.push('YOUTUBE_CLIENT_ID');
  }

  if (!clientSecret) {
    missing.push('YOUTUBE_CLIENT_SECRET');
  }

  if (!redirectUri) {
    missing.push('YOUTUBE_REDIRECT_URI');
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

export interface YouTubeProfileResponse {
  id: string;
  name: string;
  picture?: string;
  email?: string;
}

/**
 * Required scopes for YouTube API
 */
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

/**
 * Generate YouTube OAuth authorization URL
 * @param redirectUri - The callback URL where Google will redirect after authorization
 * @returns YouTube OAuth authorization URL
 */
export function getYouTubeAuthUrl(redirectUri: string): string {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('YOUTUBE_CLIENT_ID environment variable is not set');
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
export async function exchangeYouTubeCode(
  code: string,
  redirectUri: string
): Promise<YouTubeTokenResponse> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('YOUTUBE_CLIENT_ID environment variable is not set');
  }

  if (!clientSecret) {
    throw new Error('YOUTUBE_CLIENT_SECRET environment variable is not set');
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as YouTubeErrorResponse;
    throw new Error(
      error.error_description || error.error || `YouTube token exchange failed: ${response.statusText}`
    );
  }

  const tokenData = data as YouTubeTokenResponse;

  // Validate required fields
  if (!tokenData.access_token) {
    throw new Error('YouTube token response missing access_token');
  }

  if (!tokenData.refresh_token) {
    throw new Error('YouTube token response missing refresh_token');
  }

  if (typeof tokenData.expires_in !== 'number') {
    throw new Error('YouTube token response missing or invalid expires_in');
  }

  return tokenData;
}

/**
 * Fetch YouTube user profile information
 * @param accessToken - The access token to use for authentication
 * @returns Profile data including id, name, and picture
 * @throws Error if profile fetch fails
 */
export async function getYouTubeProfile(
  accessToken: string
): Promise<YouTubeProfileResponse> {
  const profileUrl = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';
  
  const response = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message || `Failed to fetch YouTube profile: ${response.statusText}`
    );
  }

  const profileData = data as YouTubeProfileResponse;

  if (!profileData.id || !profileData.name) {
    throw new Error('YouTube profile response missing required fields');
  }

  return profileData;
}











