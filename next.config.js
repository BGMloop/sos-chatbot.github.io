/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output path configuration
  outputFileTracingRoot: process.cwd(),
  
  // Configure allowed image domains
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
  
  experimental: {
    // Core optimizations
    optimizeCss: true,
    memoryBasedWorkersCount: true,
    
    // Simplified Turbopack config
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']
    }
  },
  
  // Reduce filesystem operations
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  
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
    
    return config;
  },
}

module.exports = nextConfig 