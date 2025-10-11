/** @type {import('next').NextConfig} */

const webpack = require('webpack');
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@reservoir0x/reservoir-kit-ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.reservoir.tools',
        // port: '',
        // pathname: '/account123/**',
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
