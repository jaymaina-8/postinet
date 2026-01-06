/**
 * Facebook OAuth scopes constant
 * 
 * CRITICAL NOTES:
 * - Facebook blocks unapproved scopes in Development mode
 * - Supabase Auth injects 'email' scope by default unless explicitly prevented
 * - This constant MUST NEVER include 'email' scope
 * 
 * This is the ONLY allowed scope string for Facebook OAuth requests.
 * All Facebook OAuth calls MUST use createFacebookOAuthOptions() helper
 * which enforces these scopes and validates against email scope injection.
 * 
 * Required scopes for Facebook Page management:
 * - public_profile: Basic user profile info
 * - pages_show_list: List user's Facebook Pages
 * - pages_read_engagement: Read Page engagement metrics
 * - pages_manage_metadata: Manage Page metadata
 */
export const FACEBOOK_OAUTH_SCOPES =
  'public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata';






