/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14+
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://batching.adgo.dev',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'https://batching.adgo.dev'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig