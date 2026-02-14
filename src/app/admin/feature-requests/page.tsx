"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FeatureRequestRow = {
  id: string;
  title: string;
  details: string | null;
  category: string | null;
  votes: number;
  createdAt: string;
};

export default function AdminFeatureRequestsPage() {
  const [items, setItems] = useState<FeatureRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feature-requests");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setItems(
        Array.isArray(data)
          ? data
          : (data.items ?? data.data ?? []).map((row: any) => ({
              id: row.id,
              title: row.title ?? "",
              details: row.details ?? null,
              category: row.category ?? null,
              votes: row.votes ?? 0,
              createdAt: row.createdAt ?? row.created_at ?? "",
            }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  function formatDate(iso: string) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Feature requests</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Ideas submitted from the public{" "}
            <Link
              href="/feature-request"
              className="text-emerald-400 hover:text-emerald-300"
            >
              feature request
            </Link>{" "}
            page.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-500">
          Loading feature requests…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-500">
          No feature requests yet. They will appear here once users submit ideas
          on the{" "}
          <Link href="/feature-request" className="text-emerald-400 hover:underline">
            feature request page
          </Link>
          .
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 hidden sm:table-cell">
                    Details
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Votes
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-800/80 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{row.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400 max-w-xs hidden sm:table-cell">
                      <span className="line-clamp-2">
                        {row.details || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-400">
                        {row.category || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm tabular-nums text-zinc-400">
                        {row.votes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
