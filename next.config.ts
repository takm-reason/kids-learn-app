import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  distDir: 'build',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
};

export default nextConfig;
