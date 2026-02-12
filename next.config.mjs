/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to complete even if type errors exist
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even if lint errors exist
    ignoreDuringBuilds: true,
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
