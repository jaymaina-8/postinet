/**
 * Facebook OAuth helper functions
 * Handles OAuth URL generation and token exchange
 */

/**
 * Validate that all required Facebook OAuth environment variables are set
 * @throws Error if any required environment variable is missing
 */
export function validateFacebookEnv(): void {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  const missing: string[] = [];

  if (!appId) {
    missing.push('FACEBOOK_APP_ID');
  }

  if (!appSecret) {
    missing.push('FACEBOOK_APP_SECRET');
  }

  if (!redirectUri) {
    missing.push('FACEBOOK_REDIRECT_URI');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Facebook OAuth environment variables: ${missing.join(', ')}. ` +
      `Please add them to your .env.local file.`
    );
  }
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface FacebookErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export interface FacebookPagesResponse {
  data: FacebookPage[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
}

/**
 * Required scopes for Facebook API
 */
export const FACEBOOK_SCOPES = [
  'pages_manage_posts',
  'pages_read_engagement',
  'pages_show_list',
  'pages_read_user_content',
].join(',');

/**
 * Generate Facebook OAuth authorization URL
 * @param redirectUri - The callback URL where Facebook will redirect after authorization
 * @returns Facebook OAuth authorization URL
 */
export function getFacebookAuthUrl(redirectUri: string): string {
  const appId = process.env.FACEBOOK_APP_ID;
  
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set');
  }

  const baseUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: FACEBOOK_SCOPES,
    response_type: 'code',
    state: 'postinet_facebook_oauth',
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code from Facebook OAuth callback
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns Token response with access_token and expires_in
 * @throws Error if token exchange fails
 */
export async function exchangeFacebookCode(
  code: string,
  redirectUri: string
): Promise<FacebookTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set');
  }

  if (!appSecret) {
    throw new Error('FACEBOOK_APP_SECRET environment variable is not set');
  }

  const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code: code,
  });

  const response = await fetch(`${tokenUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      error.error?.message || `Facebook token exchange failed: ${response.statusText}`
    );
  }

  const tokenData = data as FacebookTokenResponse;

  if (!tokenData.access_token) {
    throw new Error('Facebook token response missing access_token');
  }

  return tokenData;
}

/**
 * Get long-lived access token from short-lived token
 * @param shortLivedToken - The short-lived access token
 * @returns Long-lived token response
 */
export async function getLongLivedToken(
  shortLivedToken: string
): Promise<FacebookTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Facebook app credentials not configured');
  }

  const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${tokenUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      error.error?.message || `Failed to get long-lived token: ${response.statusText}`
    );
  }

  return data as FacebookTokenResponse;
}

/**
 * Fetch Facebook user profile information
 * @param accessToken - The access token to use for authentication
 * @returns Profile data including id and name
 * @throws Error if profile fetch fails
 */
export async function getFacebookProfile(
  accessToken: string
): Promise<FacebookUserProfile> {
  const profileUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`;
  
  const response = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      error.error?.message || `Failed to fetch Facebook profile: ${response.statusText}`
    );
  }

  const profileData = data as FacebookUserProfile;

  if (!profileData.id || !profileData.name) {
    throw new Error('Facebook profile response missing required fields');
  }

  return profileData;
}

/**
 * Fetch user's Facebook Pages
 * @param accessToken - The user access token
 * @returns List of pages the user manages
 */
export async function getFacebookPages(
  accessToken: string
): Promise<FacebookPage[]> {
  const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category&access_token=${accessToken}`;
  
  const response = await fetch(pagesUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      error.error?.message || `Failed to fetch Facebook pages: ${response.statusText}`
    );
  }

  const pagesData = data as FacebookPagesResponse;
  return pagesData.data || [];
}
