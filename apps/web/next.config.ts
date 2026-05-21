import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ayuda-humanitaria-api"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
