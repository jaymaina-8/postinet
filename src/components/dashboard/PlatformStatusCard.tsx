import Link from "next/link";
import { PLATFORMS } from "@/lib/platforms";

export default function PlatformStatusCard({ connectedPlatforms }: { connectedPlatforms: string[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Connected accounts</h3>
      </div>
      <div className="space-y-2">
        {connectedPlatforms.includes(PLATFORMS.FACEBOOK) && (
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
            <span className="text-zinc-300">Facebook</span>
            <span className="text-emerald-400">Connected</span>
          </div>
        )}
        {connectedPlatforms.includes(PLATFORMS.YOUTUBE) && (
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
            <span className="text-zinc-300">YouTube</span>
            <span className="text-emerald-400">Connected</span>
          </div>
        )}
        {connectedPlatforms.length === 0 && (
          <div className="text-sm text-zinc-500">No accounts connected yet.</div>
        )}
      </div>
      <Link
        href="/dashboard/accounts"
        className="inline-flex items-center justify-center rounded-lg border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-600 transition-colors"
      >
        Manage
      </Link>
    </div>
  );
}
