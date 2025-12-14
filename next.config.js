/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ewzslshgbjhecfruvsna.supabase.co'],
  },
  // Ensure proper routing
  trailingSlash: false,
  // Skip type checking during build (optional, remove if you want strict checks)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

