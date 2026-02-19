/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-build',
  turbopack: {},
  typescript: {
    ignoreBuildErrors: false,
  },
  generateBuildId: () => 'zenith-build-' + Date.now(),
  headers: async () => [
    {
      source: '/manifest.json',
      headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

export default nextConfig;
