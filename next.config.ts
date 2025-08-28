import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev, isServer }) => {
    // Hide source maps in production to obfuscate file structure
    if (!dev && !isServer) {
      config.devtool = false;
    }
    
    // Obfuscate file names in production build
    config.output = {
      ...config.output,
      filename: dev ? '[name].js' : '[contenthash].js',
      chunkFilename: dev ? '[name].js' : '[contenthash].js',
    };

    return config;
  },
  
  // Additional obfuscation settings
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['components']
  }
};

export default nextConfig;