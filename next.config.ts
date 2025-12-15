import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*", // When the browser requests /api/...
        destination: "https://13.205.7.218.sslip.io/:path*", // ...Next.js forwards it here
      },
    ];
  },
};

export default nextConfig;
