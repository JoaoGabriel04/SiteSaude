import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {},

  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;