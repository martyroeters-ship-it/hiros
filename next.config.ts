import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.31", "192.168.2.24"],
  serverExternalPackages: ["postgres"],
  outputFileTracingIncludes: {
    "/*": ["./db/**/*"],
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/care", permanent: false },
      { source: "/dashboard/:path*", destination: "/care/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
