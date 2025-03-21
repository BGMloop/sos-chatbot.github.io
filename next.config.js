/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  // Improve filesystem performance with valid Next.js 15.2.0 options
  experimental: {
    // Only use valid Next.js 15 experimental options
    optimizeCss: true,
  },
  // External packages to be bundled with server components
  serverExternalPackages: ['@clerk/backend'],
  // Reduce build time and optimize for development
  onDemandEntries: {
    // Keep generated pages in memory for longer during development
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    // Number of pages to keep in memory
    pagesBufferLength: 5,
  },
  // Specify .next directory on a faster drive if needed
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Webpack config to handle browser/node specific modules
  webpack: (config, { dev, isServer }) => {
    // Handle Node.js specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        async_hooks: false,
        'node:async_hooks': false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:stream': false,
        stream: false,
      };
    }
    
    // Optimize dev performance
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Poll using interval in environments that don't support native file watching
        poll: process.env.WEBPACK_POLLING === 'true' ? 500 : false,
        // Ignore node_modules to reduce CPU usage
        ignored: /node_modules/,
      };
    } else {
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Create a separate chunk for knowledge page components
          knowledge: {
            test: /[\\/]components[\\/]Knowledge/,
            name: 'knowledge',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Create a separate chunk for Clerk components
          clerk: {
            test: /[\\/]node_modules[\\/](@clerk|clerk)/,
            name: 'clerk',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  // Configure build output
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;