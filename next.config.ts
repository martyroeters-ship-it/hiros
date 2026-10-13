import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows 75 unless listed here. 90 on <Image> was being snapped back to 75.
    qualities: [75, 90, 100],
  },
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
