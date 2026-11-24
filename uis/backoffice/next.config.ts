import type { NextConfig } from "next";

// En Docker la API está en otro contenedor, por eso la URL se toma de API_URL.
// Se quita la barra final para evitar dobles barras en los destinos.
const apiUrl = (process.env.API_URL ?? "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/suppliers",
        destination: `${apiUrl}/suppliers`,
      },
      {
        source: "/api/suppliers/:path*",
        destination: `${apiUrl}/suppliers/:path*`,
      },
      {
        source: "/api/users",
        destination: `${apiUrl}/users`,
      },
      {
        source: "/api/users/:path*",
        destination: `${apiUrl}/users/:path*`,
      },
      {
        source: "/api/profiles",
        destination: `${apiUrl}/profiles`,
      },
      {
        source: "/api/profiles/:path*",
        destination: `${apiUrl}/profiles/:path*`,
      },
      {
        source: "/api/auth",
        destination: `${apiUrl}/auth`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/auth/:path*`,
      },
      {
        source: "/api/inventory/:path*",
        destination: `${apiUrl}/inventory/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
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
