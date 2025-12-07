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
    const youtubeConnected = searchParams.get('youtube_connected');
    const youtubeError = searchParams.get('youtube_error');
    
    if (youtubeConnected === 'true') {
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
    const { data, error } = await supabase
      .from("connected_accounts")
      .select("id, platform_username, created_at")
      .eq("platform", PLATFORMS.YOUTUBE)
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
      
      // Call API to get YouTube OAuth URL
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("You need to be signed in to connect YouTube.");
        return;
      }

      const response = await fetch("/api/youtube/auth-url", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("You need to be signed in to disconnect.");
        return;
      }
      const response = await fetch("/api/youtube/connection", {
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
              Connected{account.platform_username ? ` as ${account.platform_username}` : ""}.
            </p>
            <Button variant="outline" onClick={handleDisconnect} disabled={actionLoading}>
              {actionLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Link your YouTube account to unlock AI drafting and one-click posting.
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




