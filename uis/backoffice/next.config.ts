import type { NextConfig } from "next";

// URL base de la API de inventario, sin barra final
const inventoryApiUrl = (
  process.env.NEXT_PUBLIC_INVENTORY_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/suppliers",
        destination: "http://localhost:8000/suppliers",
      },
      {
        source: "/api/suppliers/:path*",
        destination: "http://localhost:8000/suppliers/:path*",
      },
      {
        source: "/api/users",
        destination: "http://localhost:8000/users",
      },
      {
        source: "/api/users/:path*",
        destination: "http://localhost:8000/users/:path*",
      },
      {
        source: "/api/profiles",
        destination: "http://localhost:8000/profiles",
      },
      {
        source: "/api/profiles/:path*",
        destination: "http://localhost:8000/profiles/:path*",
      },
      {
        source: "/api/auth",
        destination: "http://localhost:8000/auth",
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8000/auth/:path*",
      },
      {
        source: "/api/inventory/:path*",
        destination: `${inventoryApiUrl}/inventory/:path*`,
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
