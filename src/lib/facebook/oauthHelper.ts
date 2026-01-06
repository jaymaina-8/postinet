/**
 * Facebook OAuth Helper with Runtime Guards
 * 
 * CRITICAL: Facebook blocks unapproved scopes in Development mode.
 * Supabase Auth may inject 'email' scope by default unless explicitly prevented.
 * 
 * This helper ensures:
 * 1. Explicit scopes are always set (no defaults)
 * 2. Email scope is NEVER included (runtime validation)
 * 3. Scopes are provider-specific and isolated
 */

import { FACEBOOK_OAUTH_SCOPES } from './scopes';

/**
 * Runtime guard: Throws error if email scope is detected in any scope string
 */
function validateNoEmailScope(scopes: string, context: string): void {
  const scopeList = scopes.split(',').map(s => s.trim().toLowerCase());
  if (scopeList.includes('email')) {
    throw new Error(
      `SECURITY VIOLATION: Email scope detected in Facebook OAuth scopes at ${context}. ` +
      `Facebook blocks unapproved scopes. Scopes: ${scopes}`
    );
  }
}

/**
 * Creates validated Facebook OAuth options with explicit scopes.
 * 
 * This function:
 * - Always sets explicit scopes (overrides any Supabase defaults)
 * - Validates that email scope is never present
 * - Sets queryParams.scope to ensure URL-level enforcement
 * 
 * @param redirectTo - The OAuth redirect URL
 * @returns Validated OAuth options object
 */
export function createFacebookOAuthOptions(redirectTo: string) {
  // Validate the constant itself
  validateNoEmailScope(FACEBOOK_OAUTH_SCOPES, 'FACEBOOK_OAUTH_SCOPES constant');

  // Create options with explicit scopes in multiple places to prevent Supabase from injecting email
  const options = {
    redirectTo,
    scopes: FACEBOOK_OAUTH_SCOPES,
    queryParams: {
      // Explicitly set scope in query params to override any Supabase defaults
      scope: FACEBOOK_OAUTH_SCOPES,
    },
  };

  // Final runtime validation before returning
  validateNoEmailScope(options.scopes, 'options.scopes');
  validateNoEmailScope(options.queryParams.scope, 'options.queryParams.scope');

  return options;
}

/**
 * Validates Facebook OAuth options before use.
 * Throws if email scope is detected or scopes are missing.
 */
export function validateFacebookOAuthOptions(options: {
  scopes?: string;
  queryParams?: { scope?: string };
}): void {
  if (!options.scopes) {
    throw new Error('Facebook OAuth options.scopes is required and cannot be omitted');
  }

  validateNoEmailScope(options.scopes, 'provided options.scopes');

  if (options.queryParams?.scope) {
    validateNoEmailScope(options.queryParams.scope, 'provided options.queryParams.scope');
  }
}

