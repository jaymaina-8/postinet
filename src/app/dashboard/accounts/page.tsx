"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS, PLATFORM_LABELS, Platform } from "@/lib/platforms";

interface ConnectedAccount {
  id: string;
  platform: Platform;
  platform_username: string | null;
  facebook_page_name: string | null;
  created_at: string;
  expires_at: number | null;
}

// Wrapper component to handle Suspense for useSearchParams
export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-zinc-500">Loading accounts...</div>}>
      <AccountsPageContent />
    </Suspense>
  );
}

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth callback results immediately
    const facebookConnected = searchParams.get('facebook_connected');
    const youtubeConnected = searchParams.get('youtube_connected');
    const facebookError = searchParams.get('facebook_error');
    const youtubeError = searchParams.get('youtube_error');
    
    // Set messages based on URL params
    if (facebookConnected === 'true') {
      setSuccess('🎉 Facebook Page connected successfully!');
    } else if (youtubeConnected === 'true') {
      setSuccess('🎉 YouTube channel connected successfully!');
    } else if (facebookError) {
      setError(`Facebook connection failed: ${decodeURIComponent(facebookError)}`);
    } else if (youtubeError) {
      setError(`YouTube connection failed: ${decodeURIComponent(youtubeError)}`);
    }
    
    // Clean up URL params (remove from URL bar)
    if (facebookConnected || youtubeConnected || facebookError || youtubeError) {
      // Use setTimeout to ensure state is set before URL change
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }, 100);
    }
    
    // Fetch accounts data
    fetchAccounts();
  }, [searchParams]);
  
  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function fetchAccounts() {
    setLoading(true);
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication error. Please try logging in again.");
        setLoading(false);
        return;
      }

      if (!session) {
        // User not logged in, accounts will be empty
        setAccounts([]);
        setLoading(false);
        return;
      }

      // Try fetching with all columns first, fall back to basic columns if some don't exist
      let accountsData = null;
      let accountsError = null;

      // First try with all columns
      const result = await supabase
        .from("connected_accounts")
        .select("id, platform, platform_username, facebook_page_name, created_at, expires_at")
        .order("created_at", { ascending: false });

      if (result.error && result.error.message?.includes("does not exist")) {
        // Fallback: try with only basic columns
        const fallbackResult = await supabase
          .from("connected_accounts")
          .select("id, platform, created_at")
          .order("created_at", { ascending: false });
        
        accountsData = fallbackResult.data?.map(acc => ({
          ...acc,
          platform_username: null,
          facebook_page_name: null,
          expires_at: null,
        })) || [];
        accountsError = fallbackResult.error;
      } else {
        accountsData = result.data;
        accountsError = result.error;
      }

      // Check if error exists AND has meaningful content
      if (accountsError && accountsError.message) {
        console.error("Error fetching accounts:", accountsError.message);
        setError(accountsError.message || "Failed to fetch connected accounts");
      } else {
        setAccounts(accountsData || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching accounts:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function isTokenExpired(expiresAt: number | null): boolean {
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  }

  async function handleConnect(platform: Platform) {
    try {
      setActionLoading(platform);
      setError(null);
      setSuccess(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to connect an account.");
        return;
      }

      const endpoint = platform === PLATFORMS.FACEBOOK 
        ? "/api/facebook/auth-url" 
        : "/api/youtube/auth-url";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || `Failed to get ${platform} OAuth URL.`);
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to start OAuth.";
      setError(message);
      setActionLoading(null);
    }
  }

  async function handleDisconnect(platform: Platform) {
    try {
      setActionLoading(platform);
      setError(null);
      setSuccess(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to disconnect.");
        return;
      }

      const endpoint = platform === PLATFORMS.FACEBOOK 
        ? "/api/facebook/connection" 
        : "/api/youtube/connection";
      
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to disconnect account.");
      }
      
      setSuccess(`${PLATFORM_LABELS[platform]} disconnected successfully.`);
      fetchAccounts();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to disconnect account.";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  function getAccountByPlatform(platform: Platform): ConnectedAccount | undefined {
    return accounts.find(acc => acc.platform === platform);
  }

  function getPlatformIcon(platform: Platform) {
    switch (platform) {
      case PLATFORMS.FACEBOOK:
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case PLATFORMS.YOUTUBE:
        return (
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        );
      case PLATFORMS.INSTAGRAM:
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  }

  const platformsToShow: Platform[] = [PLATFORMS.FACEBOOK, PLATFORMS.YOUTUBE, PLATFORMS.INSTAGRAM];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Connected Accounts</h1>
        <p className="text-zinc-600">
          Manage your connected social media accounts. Connect platforms to start publishing content.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-100 border-2 border-green-400 rounded-lg p-4 shadow-md animate-pulse">
          <div className="flex items-center justify-between">
            <p className="text-green-800 font-medium text-lg">{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-100 border-2 border-red-400 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-red-800 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading accounts...</div>
      ) : (
        <div className="space-y-4">
          {platformsToShow.map((platform) => {
            const account = getAccountByPlatform(platform);
            const expired = account ? isTokenExpired(account.expires_at) : false;
            const isInstagram = platform === PLATFORMS.INSTAGRAM;
            
            return (
              <div
                key={platform}
                className={`bg-white border border-zinc-200 rounded-xl p-6 ${isInstagram ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getPlatformIcon(platform)}
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {PLATFORM_LABELS[platform]}
                      </h3>
                      
                      {isInstagram ? (
                        <p className="text-sm text-zinc-500 mt-1">Coming Soon</p>
                      ) : account ? (
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {expired ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-sm text-red-600 font-medium">Token Expired</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-green-600 font-medium">Connected</span>
                              </>
                            )}
                          </div>
                          
                          {platform === PLATFORMS.FACEBOOK && account.facebook_page_name && (
                            <p className="text-sm text-zinc-700">
                              Page: <span className="font-medium">{account.facebook_page_name}</span>
                            </p>
                          )}
                          
                          {platform === PLATFORMS.YOUTUBE && account.platform_username && (
                            <p className="text-sm text-zinc-700">
                              Channel: <span className="font-medium">{account.platform_username}</span>
                            </p>
                          )}
                          
                          <p className="text-xs text-zinc-400">
                            Connected on {new Date(account.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500 mt-1">Not connected</p>
                      )}
                    </div>
                  </div>
                  
                  {!isInstagram && (
                    <div className="flex gap-2">
                      {account ? (
                        <>
                          {expired && (
                            <button
                              onClick={() => handleConnect(platform)}
                              disabled={actionLoading === platform}
                              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === platform ? "Connecting..." : "Reconnect"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDisconnect(platform)}
                            disabled={actionLoading === platform}
                            className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === platform ? "..." : "Disconnect"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform)}
                          disabled={actionLoading === platform}
                          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === platform ? "Connecting..." : "Connect"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {expired && account && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      Your {PLATFORM_LABELS[platform]} token has expired. Please reconnect to continue posting.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-zinc-50 border border-zinc-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            <strong>Facebook:</strong> You need a Facebook Page (not a personal profile) to publish content. 
            Make sure you are an admin of the page you want to connect.
          </p>
          <p>
            <strong>YouTube:</strong> Connect your Google account that owns the YouTube channel you want to publish to.
          </p>
          <p>
            <strong>Token Expired?</strong> Social media tokens expire periodically for security. 
            Simply click "Reconnect" to refresh your connection.
          </p>
        </div>
      </div>
    </div>
  );
}



