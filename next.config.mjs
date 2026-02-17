/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-build',
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  generateBuildId: () => 'zenith-build-' + Date.now(),
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
