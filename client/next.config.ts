import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the root directory for file tracing to the monorepo root
  // This resolves the warning about multiple lockfiles
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
