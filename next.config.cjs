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
  webpack: (config, { isServer }) => {
    // Handle React compiler-runtime exports for Sanity dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Configure alias for React to ensure proper exports
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'react',
      'react/jsx-runtime': 'react/jsx-runtime',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
    };
    
    return config;
  },
  // ... your other config
}

module.exports = nextConfig