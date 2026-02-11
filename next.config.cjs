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
    
    // Configure alias to handle the React compiler-runtime issue
    config.resolve.alias = {
      ...config.resolve.alias,
      // Explicitly map the problematic import to the correct module
      'react/compiler-runtime': 'react/jsx-runtime',
      '@portabletext/editor$': '@portabletext/editor/lib/index.js',
      '@portabletext/toolkit$': '@portabletext/toolkit/lib/index.js',
      '@portabletext/types$': '@portabletext/types/lib/index.js',
    };
    
    return config;
  },
  experimental: {
    // Enable webpack 5 to handle module resolution better
    webpackBuildWorker: false,
  },
  // ... your other config
}

module.exports = nextConfig