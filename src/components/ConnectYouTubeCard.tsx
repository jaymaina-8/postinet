"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

type ConnectedAccount = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export default function ConnectYouTubeCard() {
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
    
    // Check for OAuth callback results
    const youtubeConnected = searchParams.get('youtube');
    const youtubeError = searchParams.get('youtube_error');
    
    if (youtubeConnected === 'connected') {
      // Refresh connection status after successful OAuth
      fetchConnection();
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (youtubeError) {
      setError(decodeURIComponent(youtubeError));
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

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
        .from("platform_accounts")
        .select("id, display_name, created_at")
        .eq("platform", PLATFORMS.YOUTUBE)
        .maybeSingle();

      if (result.error && result.error.message?.includes("does not exist")) {
        // Fallback: try with only basic columns
        const fallbackResult = await supabase
          .from("platform_accounts")
          .select("id, created_at")
          .eq("platform", PLATFORMS.YOUTUBE)
          .maybeSingle();
        
        if (fallbackResult.data) {
          accountData = {
            ...fallbackResult.data,
            display_name: null,
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

  async function handleConnect() {
    try {
      setActionLoading(true);
      setError(null);
      
      // Call API to get YouTube OAuth URL
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("You need to be signed in to connect YouTube.");
        return;
      }

      const response = await fetch("/api/youtube/auth-url", {
        method: "GET",
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to get YouTube OAuth URL.");
      }

      const { url } = await response.json();
      
      // Redirect to YouTube OAuth
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to start YouTube OAuth.");
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    try {
      setActionLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("You need to be signed in to disconnect.");
        return;
      }
      const response = await fetch("/api/youtube/connection", {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to disconnect account.");
      }
      setAccount(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to disconnect account.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Connect YouTube</CardTitle>
        <CardDescription>Authorize Postinet to publish on your behalf.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Checking connection...</p>
        ) : account ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Connected{account.display_name ? ` as ${account.display_name}` : ""}.
            </p>
            <Button variant="outline" onClick={handleDisconnect} disabled={actionLoading}>
              {actionLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Link your YouTube account to unlock publishing and scheduling.
            </p>
            <Button onClick={handleConnect} disabled={actionLoading}>
              {actionLoading ? "Redirecting..." : "Connect YouTube"}
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}




