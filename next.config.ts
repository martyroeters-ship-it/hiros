import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.31", "192.168.2.24"],
  serverExternalPackages: ["postgres"],
  outputFileTracingIncludes: {
    "/*": ["./db/**/*"],
  },
};

export default nextConfig;
