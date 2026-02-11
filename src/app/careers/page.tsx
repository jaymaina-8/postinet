import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">Careers</h1>
        <p className="text-zinc-400 mb-6">
          We&apos;re a small team building tools for creators. If you&apos;re interested in joining us, reach out at support@postinet.pro.
        </p>
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
