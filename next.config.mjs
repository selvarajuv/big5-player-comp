/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: process.env.NODE_ENV === 'production' ? '/big5-player-comp' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/big5-player-comp' : '',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
