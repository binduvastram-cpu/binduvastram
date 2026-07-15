/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Lets phones/tablets on the same local network load the dev server for
  // on-device testing. Add your device's LAN IP here if it's different.
  allowedDevOrigins: ['192.168.7.4'],
}

export default nextConfig
