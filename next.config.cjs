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
      // Map the problematic compiler-runtime import to the correct path
      'react/compiler-runtime': 'react/jsx-runtime',
      // Handle portable text modules that are causing issues
      '@portabletext/toolkit': '@portabletext/toolkit/react',
      '@portabletext/block-components': '@portabletext/block-components/react',
    };
    
    // Add a rule to handle problematic modules by replacing import strings
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.js$/,
      loader: function(source) {
        // Replace problematic import statements in the source
        return source.replace(
          /['"]react\/compiler-runtime['"]/g,
          '"react/jsx-runtime"'
        );
      },
      include: /node_modules\/(@portabletext|sanity)/,
    });

    return config;
  },
  experimental: {
    // Enable webpack 5 to handle module resolution better
    webpackBuildWorker: false,
  },
  // ... your other config
}

module.exports = nextConfig