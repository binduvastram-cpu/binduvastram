import os from 'node:os'

// Lets phones/tablets on the same local network load the dev server for
// on-device testing, without needing to hardcode/update an IP every time
// the machine's address changes (new network, DHCP renewal, etc).
const lanIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hbzxumxckcdgqjimxogp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  allowedDevOrigins: lanIPs,
}

export default nextConfig
