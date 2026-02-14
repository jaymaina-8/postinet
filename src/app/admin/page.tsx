import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="py-6">
      <h1 className="text-xl font-semibold text-white mb-2">Admin</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Manage feature requests and other admin-only content. This area is not
        visible or linked from the main app.
      </p>
      <ul className="space-y-2">
        <li>
          <Link
            href="/admin/feature-requests"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Feature requests →
          </Link>
          <span className="text-zinc-500 text-sm ml-2">
            View ideas submitted from the public feature request page
          </span>
        </li>
      </ul>
    </div>
  );
}
