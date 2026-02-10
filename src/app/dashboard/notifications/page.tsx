"use client";

/**
 * Notifications placeholder: list of system messages (static for now). Uses dashboard shell.
 */
export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Notifications</h1>
        <p className="text-zinc-400 text-sm mt-1">Your recent activity and alerts.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <p className="text-sm text-zinc-500">No notifications yet.</p>
        <p className="text-xs text-zinc-600 mt-1">
          When we send you updates about your posts or account, they’ll show here.
        </p>
      </div>
    </div>
  );
}
