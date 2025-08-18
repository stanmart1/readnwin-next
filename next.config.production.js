/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations for SSR
  typescript: {
    ignoreBuildErrors: false, // Enable type checking in production
  },
  
  // Full SSR configuration - no static export
  // This enables API routes and server-side rendering
  output: 'standalone', // For production deployment with Node.js server
  
  // Enable server-side features
  images: {
    unoptimized: false, // Enable image optimization
    domains: [
      'localhost',
      'readnwin.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
  
  // Webpack optimizations for production SSR
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Enable experimental features for better SSR performance
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: [
      'puppeteer',
      'puppeteer-core',
      '@sparticuz/chromium'
    ],
  },
  
  // Enable font optimization
  optimizeFonts: true,
  
  // Environment variables for production
  env: {
    NODE_ENV: 'production',
  },
};

module.exports = nextConfig;
