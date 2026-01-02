/**
 * Facebook OAuth scopes constant
 * 
 * This is the ONLY allowed scope string for Facebook OAuth requests.
 * 
 * Hard requirement: do NOT request `email`, and do NOT rely on platform defaults.
 * All Facebook signInWithOAuth calls MUST explicitly set options.scopes to this value.
 */
export const FACEBOOK_OAUTH_SCOPES =
  'public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement';

