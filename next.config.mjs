/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Verwende src-Verzeichnis
  experimental: {
    typedRoutes: true,
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: [],
  },
};

export default nextConfig;
