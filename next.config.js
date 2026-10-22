/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ensure proper transpilation for Three.js and related packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // Force cache busting - generate new build IDs
  generateBuildId: async () => {
    // Use timestamp to force fresh build
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
}

module.exports = nextConfig
