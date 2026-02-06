"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { PLATFORMS } from "@/lib/platforms";

type FacebookPage = {
  pageId: string;
  name: string | null;
  accountId: string;
};

type PageScopeContextValue = {
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  loading: boolean;
  selectPage: (page: FacebookPage) => void;
  clearSelection: () => void;
  refreshPages: () => Promise<void>;
};

const PageScopeContext = createContext<PageScopeContextValue | undefined>(undefined);

const STORAGE_KEY = "postinet.selectedFacebookPage";

export function PageScopeProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [loading, setLoading] = useState(true);

  const selectPage = useCallback((page: FacebookPage) => {
    setSelectedPage(page);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(page));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPage(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPages([]);
        setSelectedPage(null);
        return;
      }

      const { data, error } = await supabase
        .from("connected_accounts")
        .select("id, facebook_page_id, facebook_page_name, facebook_page_access_token")
        .eq("user_id", session.user.id)
        .eq("platform", PLATFORMS.FACEBOOK)
        .not("facebook_page_access_token", "is", null);

      if (error) {
        console.error("Failed to load Facebook Pages:", error.message || error);
        setPages([]);
        return;
      }

      const availablePages = (data || [])
        .filter((account) => !!account.facebook_page_id)
        .map((account) => ({
          pageId: account.facebook_page_id as string,
          name: account.facebook_page_name || "Facebook Page",
          accountId: account.id as string,
        }));

      setPages(availablePages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPages();
  }, [refreshPages]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FacebookPage;
        setSelectedPage(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && pages.length === 1 && !selectedPage) {
      selectPage(pages[0]);
    }
  }, [loading, pages, selectedPage, selectPage]);

  useEffect(() => {
    if (!selectedPage) return;
    const exists = pages.some((page) => page.pageId === selectedPage.pageId);
    if (!exists) {
      clearSelection();
    }
  }, [pages, selectedPage, clearSelection]);

  const value = useMemo(
    () => ({
      pages,
      selectedPage,
      loading,
      selectPage,
      clearSelection,
      refreshPages,
    }),
    [pages, selectedPage, loading, selectPage, clearSelection, refreshPages]
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
  const { selectedPage, clearSelection } = usePageScope();

  if (!selectedPage) return null;

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Creating for: <span className="font-medium text-zinc-100">{selectedPage.name}</span> (Facebook)
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
  const { pages, selectedPage, loading, selectPage } = usePageScope();

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">Loading Facebook Pages...</div>;
  }

  if (pages.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Connect a Facebook Page</h2>
        <p className="text-zinc-400 mb-6">
          You need a connected Facebook Page before creating or scheduling content.
        </p>
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center justify-center bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
        >
          Connect Facebook Page
        </Link>
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Select a Facebook Page</h2>
        <p className="text-zinc-400 mb-6">
          Choose the Page you want to create and schedule content for.
        </p>
        <div className="space-y-3">
          {pages.map((page) => (
            <button
              key={page.pageId}
              type="button"
              onClick={() => selectPage(page)}
              className="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-left hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <span className="font-medium text-zinc-100">{page.name}</span>
              <span className="text-sm text-zinc-400">Select</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
