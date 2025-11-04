import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Skip ESLint during production builds (Docker)
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const targetBase = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!targetBase) return [];
    const base = targetBase.replace(/\/$/, '');
    return [
      // Main API
      { source: "/api/:path*", destination: `${base}/api/:path*` },
      // Laravel Sanctum + auth endpoints
      { source: "/sanctum/:path*", destination: `${base}/sanctum/:path*` },
      { source: "/csrf-cookie", destination: `${base}/csrf-cookie` },
      { source: "/login", destination: `${base}/login` },
      { source: "/logout", destination: `${base}/logout` },
      { source: "/register", destination: `${base}/register` },
      { source: "/user", destination: `${base}/user` },
    ];
  },
};

export default nextConfig;
