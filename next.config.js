/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ewzslshgbjhecfruvsna.supabase.co',
        pathname: '/**',
      },
    ],
  },
  // Ensure proper routing
  trailingSlash: false,
  // Skip type checking during build (optional, remove if you want strict checks)
  typescript: {
    ignoreBuildErrors: false,
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
