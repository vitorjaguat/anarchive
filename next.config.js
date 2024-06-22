/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
