import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase from default 1MB to 10MB for multiple image uploads
    },
  },
  output: "standalone", // Enable for Docker containerization
};

export default nextConfig;
