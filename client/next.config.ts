import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clean config for development - no file tracing needed
  env: {
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
  },
};

export default nextConfig;
