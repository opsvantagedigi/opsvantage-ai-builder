/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Similarly ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  // ... your other config
}

module.exports = nextConfig