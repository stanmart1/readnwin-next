/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to reduce development warnings
  images: {
    domains: ['localhost', 'readnwin.com'],
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Suppress specific console warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig;