/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Desabilita algumas features experimentais para reduzir uso de memória
    serverActions: false,
    serverComponents: false,
  },
  // Otimiza o build para desenvolvimento
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduz o número de workers em dev
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
