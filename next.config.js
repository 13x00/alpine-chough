/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Images are pre-compressed by scripts/compress-images.mjs
    // Keep unoptimized: true to serve WebP directly without runtime processing
    unoptimized: true,
    // Modern format support for any runtime-optimized images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
