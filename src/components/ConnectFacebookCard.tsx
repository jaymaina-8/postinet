"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

type ConnectedAccount = {
  id: string;
  platform_username: string | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  facebook_page_access_token: string | null;
  expires_at: number | null;
  created_at: string;
};

export default function ConnectFacebookCard() {
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
    
    // Check for OAuth callback results
    // Support both 'facebook_connected' (legacy) and 'facebook=connected' (new)
    const facebookConnected = searchParams.get('facebook_connected');
    const facebookParam = searchParams.get('facebook');
    const facebookError = searchParams.get('facebook_error');
    
    if (facebookConnected === 'true' || facebookParam === 'connected') {
      // Refresh connection status after successful OAuth
      fetchConnection();
      setSuccessMessage('Facebook connected successfully!');
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    
    if (facebookError) {
      setError(decodeURIComponent(facebookError));
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  async function fetchConnection() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("connected_accounts")
      .select("id, platform_username, facebook_page_id, facebook_page_name, facebook_page_access_token, expires_at, created_at")
      .eq("platform", PLATFORMS.FACEBOOK)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      setError(error.message);
      setAccount(null);
    } else {
      setAccount(data ?? null);
    }
    setLoading(false);
  }

  async function handleConnect() {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Get the session to verify user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to connect Facebook.");
        return;
      }

      // Call API to get Facebook OAuth URL
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

      const { authUrl } = await response.json();
      
      // Redirect to Facebook OAuth
      window.location.href = authUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unable to start Facebook OAuth.";
      console.error(err);
      setError(errorMessage);
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
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
      setSuccessMessage('Facebook disconnected successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect account.";
      console.error(err);
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Connect Facebook</CardTitle>
        <CardDescription>Authorize Postinet to publish on your behalf.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Checking connection...</p>
        ) : account ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Connected{account.platform_username ? ` as ${account.platform_username}` : ""}.
            </p>
            
            {account.facebook_page_id && account.facebook_page_name ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-medium text-green-900 mb-1">Facebook Page Connected</p>
                <p className="text-xs text-green-700">Page: {account.facebook_page_name}</p>
                <p className="text-xs text-green-600">ID: {account.facebook_page_id}</p>
                <p className="text-xs text-green-600 mt-1">Posting enabled for Facebook Pages only.</p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-900 mb-1">No Facebook Page Connected</p>
                <p className="text-xs text-yellow-700">
                  Please reconnect your Facebook account to grant Page access. Posting requires a connected Page.
                </p>
              </div>
            )}
            
            {account.expires_at && account.expires_at < Date.now() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-900">Token Expired</p>
                <p className="text-xs text-red-700">Please reconnect your Facebook account.</p>
              </div>
            )}
            
            <Button variant="outline" onClick={handleDisconnect} disabled={actionLoading}>
              {actionLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Link your Facebook account to unlock AI drafting and one-click posting.
            </p>
            <Button onClick={handleConnect} disabled={actionLoading}>
              {actionLoading ? "Redirecting..." : "Connect Facebook"}
            </Button>
          </div>
        )}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
