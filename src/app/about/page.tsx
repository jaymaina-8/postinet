import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">About Postinet AI</h1>
        <p className="text-zinc-400 mb-6">
          Postinet AI helps creators and businesses post to social media with peace of mind. Upload once, schedule everywhere, and let us handle publishing on time.
        </p>
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
