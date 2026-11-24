import type { NextConfig } from "next";

// En Docker la API está en otro contenedor, por eso la URL se toma de API_URL
const apiUrl = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth",
        destination: `${apiUrl}/auth`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
