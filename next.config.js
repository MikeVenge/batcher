/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14+
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://35.247.166.100:8080',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://35.247.166.100:8080'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig