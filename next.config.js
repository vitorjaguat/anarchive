/** @type {import('next').NextConfig} */

const { hostname } = require('os');
const webpack = require('webpack');
const nextConfig = {
  reactStrictMode: true,
  // Transpile ESM/CJS packages so Webpack can handle interop on the server
  transpilePackages: ['@rainbow-me/rainbowkit', '@vanilla-extract/sprinkles'],
  // Allow Next to load CommonJS as ESM in server runtime (Vercel/preview)
  experimental: {
    esmExternals: 'loose',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.reservoir.tools',
        // port: '',
        // pathname: '/account123/**',
      },
      {
        protocol: 'https',
        hostname: 'nft-cdn.alchemy.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );
    return config;
  },
};

module.exports = nextConfig;
