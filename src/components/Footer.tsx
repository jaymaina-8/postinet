import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#111] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
              <h3 className="text-xl font-semibold text-white">Postinet</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Automated social publishing for creators and businesses.
            </p>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Product
            </h4>
            <nav className="flex flex-col space-y-2" aria-label="Product navigation">
              <Link
                href="/dashboard"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/schedule"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Schedule
              </Link>
              <Link
                href="/integrations"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Integrations
              </Link>
              <Link
                href="/pricing"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Pricing
              </Link>
              <Link
                href="/support"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Support
              </Link>
            </nav>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <nav className="flex flex-col space-y-2" aria-label="Legal navigation">
              <Link
                href="/privacy"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                Terms of Service
              </Link>
              <Link
                href="/delete-data"
                className="text-sm transition-colors hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111]"
              >
                User Data Deletion
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} Postinet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

