/**
 * Facebook OAuth Helper Functions
 * 
 * This file provides helper functions for Facebook OAuth integration.
 * 
 * Production URLs:
 * - App URL: https://www.postinet.pro
 * - API callback: https://www.postinet.pro/api/facebook/exchange
 * - Local dev callback: http://localhost:3000/api/facebook/exchange
 */

/**
 * Required Facebook OAuth scopes for Postinet
 * - pages_show_list: View list of Pages you manage
 * - pages_manage_posts: Create, edit and delete your Page posts
 * - pages_read_engagement: Read content posted on the Page
 */
export const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
] as const;

/**
 * Generate Facebook OAuth authorization URL
 * 
 * This function builds the Facebook OAuth URL that users should be redirected to
 * in order to authorize Postinet to access their Facebook Pages.
 * 
 * @returns Facebook OAuth authorization URL
 * @throws Error if FACEBOOK_APP_ID is not set
 * 
 * @example
 * // In a component or API route:
 * const authUrl = getFacebookAuthUrl();
 * // Redirect user to authUrl
 */
export function getFacebookAuthUrl(): string {
  const appId = process.env.FACEBOOK_APP_ID;
  
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set');
  }

  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  
  if (!redirectUri) {
    throw new Error('FACEBOOK_REDIRECT_URI environment variable is not set');
  }

  const encodedRedirect = encodeURIComponent(redirectUri);
  const scopes = FACEBOOK_SCOPES.join(',');

  return `https://www.facebook.com/${graphApiVersion}/dialog/oauth?client_id=${appId}&redirect_uri=${encodedRedirect}&scope=${scopes}`;
}

/**
 * Generate Facebook OAuth authorization URL with custom redirect URI
 * 
 * @param customRedirectUri - Custom redirect URI (useful for local development)
 * @returns Facebook OAuth authorization URL
 * @throws Error if FACEBOOK_APP_ID is not set
 */
export function getFacebookAuthUrlWithRedirect(customRedirectUri: string): string {
  const appId = process.env.FACEBOOK_APP_ID;
  
  if (!appId) {
    throw new Error('FACEBOOK_APP_ID environment variable is not set');
  }

  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';
  const encodedRedirect = encodeURIComponent(customRedirectUri);
  const scopes = FACEBOOK_SCOPES.join(',');

  return `https://www.facebook.com/${graphApiVersion}/dialog/oauth?client_id=${appId}&redirect_uri=${encodedRedirect}&scope=${scopes}`;
}

/**
 * Check if Facebook OAuth is properly configured
 * 
 * @returns Object with configuration status and missing variables
 */
export function checkFacebookConfig(): { 
  isConfigured: boolean; 
  missing: string[];
} {
  const missing: string[] = [];
  
  if (!process.env.FACEBOOK_APP_ID) {
    missing.push('FACEBOOK_APP_ID');
  }
  
  if (!process.env.FACEBOOK_APP_SECRET) {
    missing.push('FACEBOOK_APP_SECRET');
  }
  
  if (!process.env.FACEBOOK_REDIRECT_URI) {
    missing.push('FACEBOOK_REDIRECT_URI');
  }

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}

