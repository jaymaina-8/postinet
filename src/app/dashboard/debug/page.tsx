"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function DebugPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setLoading(true);
    setError(null);
    
    try {
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      if (!session) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      // Check Facebook connection
      const fbResponse = await fetch("/api/facebook/connection", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      const fbData = await fbResponse.json();

      // Get all connected accounts from Supabase directly
      const { data: accounts, error: accountsError } = await supabase
        .from("connected_accounts")
        .select("*");

      setStatus({
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        facebook: fbData,
        allAccounts: accounts || [],
        accountsError: accountsError?.message || null,
      });
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug: Connection Status</h1>
      
      <button
        onClick={checkConnection}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Refresh Status
      </button>

      {loading && <p className="text-zinc-500">Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {status && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-2">User Info</h2>
            <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(status.user, null, 2)}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-2">Facebook Connection (via API)</h2>
            <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(status.facebook, null, 2)}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-2">All Connected Accounts (direct from DB)</h2>
            {status.accountsError && (
              <p className="text-red-600 mb-2">Error: {status.accountsError}</p>
            )}
            <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(status.allAccounts, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

