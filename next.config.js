/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Production output configuration
  output: 'standalone', // Enable for Docker deployments
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'readnwin.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Disabled due to production issues
  },

  // Environment variables (don't include NODE_ENV here)
  env: {
    TZ: 'Africa/Lagos',
  },

  // Experimental features
  experimental: {
    // Server-side packages that should not be bundled
    serverComponentsExternalPackages: [
      'puppeteer',
      'puppeteer-core',
      '@sparticuz/chromium',
      'epubjs'
    ],
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix chunk loading issues
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all'
          }
        }
      };
    }
    // Path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/utils': path.resolve(__dirname, 'utils'),
      '@/contexts': path.resolve(__dirname, 'contexts'),
      '@/stores': path.resolve(__dirname, 'stores'),
      '@/types': path.resolve(__dirname, 'types'),
    }

    // Ignore packages that shouldn't be bundled on client-side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'puppeteer': false,
        'puppeteer-core': false,
        '@sparticuz/chromium': false,
        'fs': false,
        'path': false,
        'os': false,
        'epubjs': false,
        'connect': false,
        'colors': false,
        'optimist': false,
        'portfinder': false,
      }
    }

    // Handle node modules that need special treatment
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    // Fix epub2 module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'zipfile': false, // Disable zipfile module that epub2 tries to use
      'connect': false,
      'colors': false,
      'optimist': false,
      'portfinder': false,
    }

    // Only ignore puppeteer on client-side builds
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^puppeteer$/,
          contextRegExp: /node_modules/,
        })
      )
    }

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.flutterwave.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://checkout.flutterwave.com https://api.flutterwave.com",
              "frame-src 'self' https://checkout.flutterwave.com https://checkout-v3-ui-prod.f4b-flutterwave.com https://js.stripe.com",
              "media-src 'self' blob: data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          },
        ],
      },
    ]
  },

  // Redirects (if needed)
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: true,
      // },
    ]
  },

  // Rewrites (if needed)
  async rewrites() {
    return [
      // Serve book covers from storage
      {
        source: '/storage/covers/:path*',
        destination: '/api/storage/covers/:path*',
      },
      // Serve uploaded files from the uploads directory
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
      // Serve static files from public directory (including carousel)
      {
        source: '/carousel/:path*',
        destination: '/api/static/carousel/:path*',
      },
      // Serve book files from the book-files directory (legacy support)
      {
        source: '/book-files/:path*',
        destination: '/api/book-files/:path*',
      },
      // Serve files from the new media_root structure
      {
        source: '/media_root/:path*',
        destination: '/api/book-files/:path*',
      },
      // Serve images from public directory
      {
        source: '/images/:path*',
        destination: '/api/images/:path*',
      },
    ];
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    
    // Styled Components (if you're using them)
    // styledComponents: true,
  },

  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during builds (not recommended for production)
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors during builds (not recommended)
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true,         // Enable gzip compression

  // API routes configuration
  
}

module.exports = nextConfig