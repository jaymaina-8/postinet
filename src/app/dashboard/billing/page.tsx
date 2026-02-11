"use client";

/**
 * Billing placeholder: Coming soon + plan info. Uses dashboard shell (layout.tsx).
 */
export default function BillingPage() {
  return (
    <div className="max-w-2xl mx-auto pt-4 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Billing</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your plan and payment.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <p className="text-zinc-300 font-medium">Coming soon</p>
        <p className="text-sm text-zinc-500 mt-2">
          Plan and billing options will be available here.
        </p>
      </div>
    </div>
  );
}
