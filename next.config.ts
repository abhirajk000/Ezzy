import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Webpack configurations disabled for stable deployment
  // Additional obfuscation settings
  productionBrowserSourceMaps: false,
};

export default nextConfig;