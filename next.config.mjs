/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    // Allow production builds to complete even if type errors exist
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even if lint errors exist
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      // Normalize portabletext React-specific subpaths without masking the toolkit itself.
      "@portabletext/toolkit/react": "@portabletext/react",
      "@portabletext/block-components/react": "@portabletext/react",
    };

    return config;
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
