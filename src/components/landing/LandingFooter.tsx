import Link from "next/link";

/**
 * Simple footer: Privacy, Terms, Contact, Copyright.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-10 px-4">
      <div className="mx-auto max-w-[1100px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-zinc-500" aria-label="Footer">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">
            Terms
          </Link>
          <a href="mailto:support@postinet.com" className="hover:text-zinc-300 transition-colors">
            Contact
          </a>
        </nav>
        <p className="text-xs text-zinc-600">
          © {year} Postinet AI
        </p>
      </div>
    </footer>
  );
}
