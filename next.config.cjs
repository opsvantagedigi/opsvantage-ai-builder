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
      // Add alias to handle the module resolution issue with next/link
      'next/link': 'next/link',
      'next/router': 'next/router',
      'next/navigation': 'next/navigation',
    };
    
    // Add a rule to handle the compiler-runtime issue
    config.resolve.conditionNames = ['require', 'node', 'import'];
    
    return config;
  },
  experimental: {
    // Enable webpack 5 to handle module resolution better
    webpackBuildWorker: false,
  },
  // ... your other config
}

module.exports = nextConfig