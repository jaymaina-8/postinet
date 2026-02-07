"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS, Platform } from "@/lib/platforms";

type PlatformAccount = {
  platform: Platform;
  accountId: string;
  name: string | null;
  recordId: string;
};

type PageScopeContextValue = {
  accounts: PlatformAccount[];
  selectedAccount: PlatformAccount | null;
  loading: boolean;
  selectAccount: (account: PlatformAccount) => void;
  clearSelection: () => void;
  refreshAccounts: () => Promise<void>;
};

const PageScopeContext = createContext<PageScopeContextValue | undefined>(undefined);

const STORAGE_KEY = "postinet.selectedPlatformAccount";

export function PageScopeProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PlatformAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const selectAccount = useCallback((account: PlatformAccount) => {
    setSelectedAccount(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAccount(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAccounts([]);
        setSelectedAccount(null);
        return;
      }

      const [facebookResult, youtubeResult] = await Promise.all([
        supabase
          .from("connected_accounts")
          .select("id, facebook_page_id, facebook_page_name, facebook_page_access_token")
          .eq("user_id", session.user.id)
          .eq("platform", PLATFORMS.FACEBOOK)
          .not("facebook_page_access_token", "is", null),
        supabase
          .from("platform_accounts")
          .select("id, platform_account_id, display_name, platform")
          .eq("user_id", session.user.id)
          .eq("platform", PLATFORMS.YOUTUBE),
      ]);

      if (facebookResult.error && !facebookResult.error.message?.includes("does not exist")) {
        console.error("Failed to load Facebook Pages:", facebookResult.error.message || facebookResult.error);
      }

      if (youtubeResult.error && !youtubeResult.error.message?.includes("does not exist")) {
        console.error("Failed to load YouTube channels:", youtubeResult.error.message || youtubeResult.error);
      }

      const facebookAccounts = (facebookResult.data || [])
        .filter((account) => !!account.facebook_page_id)
        .map((account) => ({
          platform: PLATFORMS.FACEBOOK,
          accountId: account.facebook_page_id as string,
          name: account.facebook_page_name || "Facebook Page",
          recordId: account.id as string,
        }));

      const youtubeAccounts = (youtubeResult.data || []).map((account) => ({
        platform: PLATFORMS.YOUTUBE,
        accountId: account.platform_account_id as string,
        name: account.display_name || "YouTube Channel",
        recordId: account.id as string,
      }));

      setAccounts([...facebookAccounts, ...youtubeAccounts]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PlatformAccount;
        setSelectedAccount(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && accounts.length === 1 && !selectedAccount) {
      selectAccount(accounts[0]);
    }
  }, [loading, accounts, selectedAccount, selectAccount]);

  useEffect(() => {
    if (!selectedAccount) return;
    const exists = accounts.some(
      (account) =>
        account.platform === selectedAccount.platform &&
        account.accountId === selectedAccount.accountId
    );
    if (!exists) {
      clearSelection();
    }
  }, [accounts, selectedAccount, clearSelection]);

  const value = useMemo(
    () => ({
      accounts,
      selectedAccount,
      loading,
      selectAccount,
      clearSelection,
      refreshAccounts,
    }),
    [accounts, selectedAccount, loading, selectAccount, clearSelection, refreshAccounts]
  );

  return <PageScopeContext.Provider value={value}>{children}</PageScopeContext.Provider>;
}

export function usePageScope() {
  const context = useContext(PageScopeContext);
  if (!context) {
    throw new Error("usePageScope must be used within a PageScopeProvider");
  }
  return context;
}

export function PageScopeIndicator() {
  const { selectedAccount, clearSelection } = usePageScope();

  if (!selectedAccount) return null;

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Creating for: <span className="font-medium text-zinc-100">{selectedAccount.name}</span> (
          {selectedAccount.platform === PLATFORMS.FACEBOOK ? "Facebook" : "YouTube"})
        </span>
        <button
          type="button"
          onClick={clearSelection}
          className="text-emerald-400 hover:underline"
        >
          Change Page
        </button>
      </div>
    </div>
  );
}

export function PageGate({ children }: { children: React.ReactNode }) {
  const { accounts, selectedAccount, loading, selectAccount } = usePageScope();

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">Loading connected accounts...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Connect a destination</h2>
        <p className="text-zinc-400 mb-6">
          Connect a Facebook Page or YouTube Channel before creating or scheduling content.
        </p>
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center justify-center bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
        >
          Connect accounts
        </Link>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Select a destination</h2>
        <p className="text-zinc-400 mb-6">
          Choose the account you want to create and schedule content for.
        </p>
        <div className="space-y-3">
          {accounts.map((account) => (
            <button
              key={`${account.platform}-${account.accountId}`}
              type="button"
              onClick={() => selectAccount(account)}
              className="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-left hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <span className="font-medium text-zinc-100">{account.name}</span>
              <span className="text-sm text-zinc-400">
                {account.platform === PLATFORMS.FACEBOOK ? "Facebook" : "YouTube"}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
