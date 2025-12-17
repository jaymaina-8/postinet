"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

type ConnectedAccount = {
  id: string;
  platform_username: string | null;
  facebook_page_name: string | null;
  facebook_page_access_token: string | null;
  created_at: string;
  expires_at: number | null;
};

export default function ConnectFacebookCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const facebookConnected = searchParams.get("facebook") === "connected";
  const facebookError = searchParams.get("facebook_error");
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Force a server refresh after OAuth redirect so server components re-fetch data
  useEffect(() => {
    if (facebookConnected) {
      router.refresh();
      setSuccess('Facebook Page connected successfully!');
      fetchConnection();
    }
  }, [facebookConnected, router]);

  useEffect(() => {
    if (facebookError) {
      setError(decodeURIComponent(facebookError));
    }
  }, [facebookError]);

  useEffect(() => {
    fetchConnection();
  }, []);

  async function fetchConnection() {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAccount(null);
        setLoading(false);
        return;
      }

      // Try fetching with all columns, fall back to basic if some don't exist
      let accountData = null;
      
      const result = await supabase
        .from("connected_accounts")
        .select("id, platform_username, facebook_page_name, facebook_page_access_token, created_at, expires_at")
        .eq("user_id", session.user.id)
        .eq("platform", PLATFORMS.FACEBOOK)
        .not("facebook_page_access_token", "is", null)
        .maybeSingle();

      if (result.error && result.error.message?.includes("does not exist")) {
        // Fallback: try with only basic columns
        const fallbackResult = await supabase
          .from("connected_accounts")
          .select("id, facebook_page_access_token, created_at")
          .eq("user_id", session.user.id)
          .eq("platform", PLATFORMS.FACEBOOK)
          .not("facebook_page_access_token", "is", null)
          .maybeSingle();
        
        if (fallbackResult.data) {
          accountData = {
            ...fallbackResult.data,
            platform_username: null,
            facebook_page_name: null,
            expires_at: null,
          };
        }
      } else if (result.error && result.error.code !== "PGRST116" && result.error.message) {
        setError(result.error.message);
        setAccount(null);
        return;
      } else {
        accountData = result.data;
      }

      setAccount(accountData ?? null);
    } catch (err) {
      console.error("Error in fetchConnection:", err);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }

  function isTokenExpired(): boolean {
    if (!account?.expires_at) return false;
    return Date.now() > account.expires_at;
  }

  async function handleConnect() {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to connect Facebook.");
        return;
      }

      const response = await fetch("/api/facebook/auth-url", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to get Facebook OAuth URL.");
      }

      const { url } = await response.json();
      
      // Redirect to Facebook OAuth
      window.location.href = url;
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unable to start Facebook OAuth.";
      setError(message);
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to disconnect.");
        return;
      }
      
      const response = await fetch("/api/facebook/connection", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to disconnect account.");
      }
      
      setAccount(null);
      setSuccess("Facebook disconnected successfully.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to disconnect account.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  const tokenExpired = isTokenExpired();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <CardTitle>Facebook</CardTitle>
            <CardDescription>Connect your Facebook Page</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Checking connection...</p>
        ) : account ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {tokenExpired ? (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
              <span className="text-sm text-zinc-600">
                {tokenExpired ? "Token Expired" : "Connected"}
              </span>
            </div>
            
            {account.facebook_page_name && (
              <p className="text-sm font-medium text-zinc-800">
                Page: {account.facebook_page_name}
              </p>
            )}
            
            {account.platform_username && !account.facebook_page_name && (
              <p className="text-sm text-zinc-600">
                Account: {account.platform_username}
              </p>
            )}
            
            <p className="text-xs text-zinc-400">
              Connected on {new Date(account.created_at).toLocaleDateString()}
            </p>
            
            {tokenExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  Your Facebook token has expired. Please reconnect to continue posting.
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {tokenExpired && (
                <Button onClick={handleConnect} disabled={actionLoading}>
                  {actionLoading ? "Connecting..." : "Reconnect"}
                </Button>
              )}
              <Button variant="outline" onClick={handleDisconnect} disabled={actionLoading}>
                {actionLoading ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Connect your Facebook Page to start publishing content with AI-generated captions.
            </p>
            <Button onClick={handleConnect} disabled={actionLoading}>
              {actionLoading ? "Redirecting..." : "Connect Facebook"}
            </Button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
