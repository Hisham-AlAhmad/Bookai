/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      // Polling helps file detection on WSL-mounted filesystems.
      poll: 1000,
      aggregateTimeout: 300,
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
    }
    return config
  },
}

export default nextConfig
