import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth",
        destination: "http://localhost:8000/auth",
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8000/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
