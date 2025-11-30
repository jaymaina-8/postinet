"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";

type ConnectedAccount = {
  id: string;
  platform_username: string | null;
  created_at: string;
};

const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"];

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(hashBuffer);
}

function generateCodeVerifier() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(randomBytes.buffer);
}

function ensureTwitterEnv() {
  const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("Twitter OAuth environment variables are missing.");
  }
  return { clientId, redirectUri };
}

export default function ConnectTwitterCard() {
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
  }, []);

  async function fetchConnection() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("connected_accounts")
      .select("id, platform_username, created_at")
      .eq("platform", "twitter")
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
      const { clientId, redirectUri } = ensureTwitterEnv();
      const state = crypto.randomUUID();
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await sha256(codeVerifier);

      sessionStorage.setItem("twitter_state", state);
      sessionStorage.setItem("twitter_code_verifier", codeVerifier);

      const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      window.location.href = authUrl.toString();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to start Twitter OAuth.");
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
      const response = await fetch("/api/twitter/connection", {
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
        <CardTitle>Connect Twitter / X</CardTitle>
        <CardDescription>Authorize Postinet to publish on your behalf.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Checking connection...</p>
        ) : account ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Connected{account.platform_username ? ` as @${account.platform_username}` : ""}.
            </p>
            <Button variant="outline" onClick={handleDisconnect} disabled={actionLoading}>
              {actionLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Link your Twitter/X account to unlock AI drafting and one-click posting.
            </p>
            <Button onClick={handleConnect} disabled={actionLoading}>
              {actionLoading ? "Redirecting..." : "Connect Twitter/X"}
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}

