import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*", // When the browser requests /api/...
        destination: "https://13.205.7.218.sslip.io/:path*", // ...Next.js forwards it here
      },
    ];
  },

  // Enable modern bundler optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },

  // Reduce JavaScript sent to client
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Enable gzip compression headers
  compress: true,

  // Reduce powered-by header for security and smaller response
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,
};

export default nextConfig;
