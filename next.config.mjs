import { fileURLToPath } from "node:url";

const reactCompilerRuntimeShim = fileURLToPath(
  new URL("./src/lib/shims/react-compiler-runtime.ts", import.meta.url),
);

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      // Resolve packages compiled with the React compiler against a local shim for React 18.
      "react/compiler-runtime$": reactCompilerRuntimeShim,
    };

    return config;
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
