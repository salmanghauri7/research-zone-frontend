import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactCompiler: true,
  reactStrictMode: false,

  // Enable modern bundler optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  compress: true,

  // Reduce powered-by header for security and smaller response
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,

  async rewrites() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    const apiBase = process.env.NEXT_PUBLIC_BASE_URL_API_PROD;
    if (!apiBase) {
      return [];
    }

    const normalizedApiBase = apiBase.trimEnd();

    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${normalizedApiBase}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
