/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
