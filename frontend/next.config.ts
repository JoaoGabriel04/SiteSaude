import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {},

  async headers() {
    const csp =
      "default-src 'self'; " +
      "base-uri 'self'; " +
      "frame-ancestors 'none'; " +
      "form-action 'self'; " +
      "img-src 'self' data: https: blob:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "connect-src 'self' https: http: ws: wss:; " +
      "font-src 'self' data: https:;";

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },

  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;