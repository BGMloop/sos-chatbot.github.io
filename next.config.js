/** @type {import('next').NextConfig} */

// Production configuration focusing on standalone output
const nextConfig = {
  // Create a standalone build that includes all dependencies
  output: 'standalone',
  
  // Skip type checking and linting for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable basic optimizations
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Configure image domains
  images: {
    domains: ['via.placeholder.com', 'placehold.co'],
  },
  
  // Only use these file extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Static optimization configuration
  staticPageGenerationTimeout: 180,
  
  // Disable experimental features that might cause issues
  experimental: {
    // No experimental features enabled
  },
}

module.exports = nextConfig;