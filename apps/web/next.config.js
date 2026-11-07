/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-slide-studio/shared'],
  reactStrictMode: false, // Prevents double mounting during GSAP timeline initialization in dev
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
