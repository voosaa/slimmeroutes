/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Base path if you're not deploying to the root of your domain
  // basePath: '/drivewise',
}

module.exports = nextConfig
