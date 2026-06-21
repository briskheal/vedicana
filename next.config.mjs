/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oeuelrgzxtogwmotdomd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'vedicana.com',
      },
      {
        protocol: 'https',
        hostname: 'www.vedicana.com',
      }
    ],
  },
};

export default nextConfig;
