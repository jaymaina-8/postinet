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
}

module.exports = nextConfig
