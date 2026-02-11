"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Asset = {
  id: string;
  media_url: string;
  created_at: string;
};

type Filter = "all" | "image" | "video";

function getMediaType(url: string): "image" | "video" {
  const lower = url.toLowerCase();
  if (lower.match(/\.(mp4|webm|mov|m4v)$/)) return "video";
  return "image";
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAssets([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, media_url, created_at")
        .eq("user_id", session.user.id)
        .not("media_url", "is", null)
        .order("created_at", { ascending: false });

      if (!error) {
        setAssets((data || []).filter((item) => !!item.media_url));
      }
      setLoading(false);
    }
    fetchAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    if (filter === "all") return assets;
    return assets.filter((asset) => getMediaType(asset.media_url) === filter);
  }, [assets, filter]);

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Asset library</h1>
        <p className="text-zinc-400">Reuse your media across posts.</p>
      </div>

      <div className="flex gap-2">
        {(["all", "image", "video"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === item
                ? "bg-emerald-500 text-zinc-950"
                : "border border-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {item === "all" ? "All" : item === "image" ? "Images" : "Videos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500">Loading assets...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
          <p className="text-zinc-400">No assets found.</p>
          <p className="text-sm text-zinc-500 mt-2">Upload media to start building your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              <div className="aspect-video bg-zinc-950 flex items-center justify-center text-xs text-zinc-500">
                {getMediaType(asset.media_url) === "image" ? (
                  <img src={asset.media_url} alt="Asset preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    Video asset
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  {new Date(asset.created_at).toLocaleDateString()}
                </div>
                <a
                  href={`/dashboard/generate?mediaUrl=${encodeURIComponent(asset.media_url)}`}
                  className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Use in composer
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
