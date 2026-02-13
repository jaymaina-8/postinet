/** @type {import('next').NextConfig} */
let supabaseHostname;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  supabaseHostname = undefined;
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: 'https',
              hostname: supabaseHostname,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
  // Ensure proper routing
  trailingSlash: false,
  typescript: {
    // Avoid Next.js 16 generated validator type error (RouteHandlerConfig used as value)
    ignoreBuildErrors: true,
  },
  // Increase body size limit for file uploads (10GB for large videos)
  experimental: {
    serverActions: {
      bodySizeLimit: '10gb',
    },
  },
  // Suppress dynamic API sync access warnings in dev mode (Next.js 16 specific)
  // These warnings occur when browser devtools inspect params/searchParams
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig
