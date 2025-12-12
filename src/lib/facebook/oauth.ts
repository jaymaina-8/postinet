/**
 * Facebook OAuth helper functions
 * Handles OAuth URL generation and token exchange
 * 
 * Production URLs:
 * - App URL: https://www.postinet.pro
 * - API callback: https://www.postinet.pro/api/facebook/exchange
 * - Local dev callback: http://localhost:3000/api/facebook/exchange
 */

/**
 * Validate that all required Facebook OAuth environment variables are set
 * @throws Error if any required environment variable is missing
 */
export function validateFacebookEnv(): void {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';

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

  // Log API version being used (for debugging)
  if (process.env.FACEBOOK_GRAPH_API_VERSION) {
    console.log(`Using Facebook Graph API version: ${graphApiVersion}`);
  }
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

/**
 * Required scopes for Facebook Pages API
 */
export const FACEBOOK_SCOPES = [
  'pages_manage_posts',
  'pages_read_engagement',
  'pages_show_list',
  'public_profile',
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

  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const baseUrl = `https://www.facebook.com/${graphApiVersion}/dialog/oauth`;
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: FACEBOOK_SCOPES,
    response_type: 'code',
    auth_type: 'rerequest', // Re-request permissions if user previously denied
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token (short-lived)
 * @param code - Authorization code from Facebook OAuth callback
 * @param redirectUri - The redirect URI used in the authorization request
 * @returns Token response with access_token, expires_in, and token_type
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

  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const tokenUrl = `https://graph.facebook.com/${graphApiVersion}/oauth/access_token`;
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

  // Validate required fields
  if (!tokenData.access_token) {
    throw new Error('Facebook token response missing access_token');
  }

  if (!tokenData.token_type) {
    throw new Error('Facebook token response missing token_type');
  }

  if (typeof tokenData.expires_in !== 'number') {
    throw new Error('Facebook token response missing or invalid expires_in');
  }

  return tokenData;
}

/**
 * Exchange short-lived user token for long-lived user token
 * Long-lived tokens are valid for ~60 days
 * @param shortLivedToken - Short-lived access token from initial OAuth exchange
 * @returns Token response with long-lived access_token
 * @throws Error if token exchange fails
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<FacebookTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set');
  }

  if (!appSecret) {
    throw new Error('FACEBOOK_APP_SECRET environment variable is not set');
  }

  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const tokenUrl = `https://graph.facebook.com/${graphApiVersion}/oauth/access_token`;
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
      error.error?.message || `Failed to exchange for long-lived token: ${response.statusText}`
    );
  }

  const tokenData = data as FacebookTokenResponse;

  // Validate required fields
  if (!tokenData.access_token) {
    throw new Error('Long-lived token response missing access_token');
  }

  // Long-lived tokens may not always include token_type, set default
  if (!tokenData.token_type) {
    tokenData.token_type = 'bearer';
  }

  // Long-lived tokens typically expire in ~60 days (5184000 seconds)
  // If expires_in is not provided, default to 60 days
  if (typeof tokenData.expires_in !== 'number') {
    tokenData.expires_in = 5184000; // 60 days in seconds
  }

  console.log(`Long-lived token obtained, expires in ${tokenData.expires_in} seconds (~${Math.round(tokenData.expires_in / 86400)} days)`);

  return tokenData;
}

/**
 * Facebook Page data structure
 */
export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
}

/**
 * Facebook Pages API response
 */
export interface FacebookPagesResponse {
  data: FacebookPage[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

/**
 * Fetch list of Facebook Pages the user manages
 * @param longLivedUserToken - Long-lived user access token
 * @returns Array of Facebook Pages with their access tokens
 * @throws Error if fetching pages fails
 */
export async function fetchUserPages(
  longLivedUserToken: string
): Promise<FacebookPage[]> {
  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const pagesUrl = `https://graph.facebook.com/${graphApiVersion}/me/accounts`;
  const params = new URLSearchParams({
    access_token: longLivedUserToken,
    fields: 'id,name,access_token,category,tasks',
  });

  const response = await fetch(`${pagesUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      error.error?.message || `Failed to fetch Facebook Pages: ${response.statusText}`
    );
  }

  const pagesData = data as FacebookPagesResponse;

  if (!pagesData.data || !Array.isArray(pagesData.data)) {
    return [];
  }

  // Validate each page has required fields
  const validPages = pagesData.data.filter((page) => {
    if (!page.id || !page.name || !page.access_token) {
      console.warn(`Skipping invalid page data:`, page);
      return false;
    }
    return true;
  });

  console.log(`Found ${validPages.length} valid Facebook Page(s)`);
  
  return validPages;
}

