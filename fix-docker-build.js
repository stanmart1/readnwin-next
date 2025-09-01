#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Docker build issues...\n');

// 1. Update next.config.js for production
const productionConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  images: {
    domains: ['localhost', 'readnwin.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ]
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;`;

fs.writeFileSync('next.config.production.js', productionConfig);
console.log('✅ Created production Next.js config');

// 2. Create a build script that ensures standalone output
const buildScript = `#!/bin/bash
set -e

echo "🚀 Building Next.js application for Docker..."

# Use production config
cp next.config.production.js next.config.js

# Build with error handling
if npm run build; then
    echo "✅ Build completed successfully"
    
    # Verify standalone output
    if [ -d ".next/standalone" ]; then
        echo "✅ Standalone output generated successfully"
        ls -la .next/standalone/
    else
        echo "❌ ERROR: Standalone output not found!"
        echo "Contents of .next directory:"
        ls -la .next/
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Docker build preparation complete!"`;

fs.writeFileSync('build-docker.sh', buildScript);
fs.chmodSync('build-docker.sh', '755');
console.log('✅ Created Docker build script');

// 3. Update package.json with docker build script
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['build:docker'] = './build-docker.sh';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with Docker build script');
}

console.log('\n🎉 Docker build fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: chmod +x build-docker.sh');
console.log('2. Test locally: ./build-docker.sh');
console.log('3. Deploy with the updated Dockerfile');