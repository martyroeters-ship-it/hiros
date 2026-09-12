import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.31", "192.168.2.24"],
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
