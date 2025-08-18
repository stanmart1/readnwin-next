#!/bin/bash

# Coolify Deployment Preparation Script
# This script helps prepare your Next.js app for Coolify deployment

set -e

echo "🚀 Preparing ReadNWin Next.js app for Coolify deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if docker-compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Check if .env.production exists
check_env_file() {
    print_status "Checking environment file..."
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production file not found"
        print_status "Creating .env.production template..."
        cat > .env.production << 'EOF'
# Production Environment Configuration
# Update these values with your actual production credentials

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Database Configuration
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432

# Payment Gateway Configuration
FLUTTER_WAVE_HASH=your-flutterwave-hash
RAVE_LIVE_PUBLIC_KEY=your-rave-public-key
RAVE_LIVE_SECRET_KEY=your-rave-secret-key

# Email Configuration
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Environment
NODE_ENV=production

# Timezone
TZ=Africa/Lagos
EOF
        print_warning "Please update .env.production with your actual production credentials"
    else
        print_success ".env.production file exists"
    fi
}

# Build Docker image
build_docker_image() {
    print_status "Building Docker image..."
    docker build -t readnwin-app:latest .
    print_success "Docker image built successfully"
}

# Test Docker container locally
test_docker_container() {
    print_status "Testing Docker container locally..."
    
    # Stop any existing container
    docker stop readnwin-test 2>/dev/null || true
    docker rm readnwin-test 2>/dev/null || true
    
    # Run container
    docker run -d \
        --name readnwin-test \
        --env-file .env.production \
        -p 3000:3000 \
        readnwin-app:latest
    
    print_status "Waiting for container to start..."
    sleep 10
    
    # Test health check
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        docker logs readnwin-test
        exit 1
    fi
    
    # Test application
    if curl -f http://localhost:3000/api/books > /dev/null 2>&1; then
        print_success "Application is responding"
    else
        print_warning "Application test failed (this might be expected if database is not configured)"
    fi
    
    # Stop test container
    docker stop readnwin-test
    docker rm readnwin-test
    print_success "Local test completed"
}

# Test with docker-compose
test_docker_compose() {
    print_status "Testing with Docker Compose..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Start services
    docker-compose up -d
    
    print_status "Waiting for services to start..."
    sleep 15
    
    # Test health check
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Docker Compose health check passed"
    else
        print_error "Docker Compose health check failed"
        docker-compose logs
        exit 1
    fi
    
    # Stop services
    docker-compose down
    print_success "Docker Compose test completed"
}

# Generate deployment summary
generate_summary() {
    print_status "Generating deployment summary..."
    
    cat > DEPLOYMENT_SUMMARY.md << 'EOF'
# Coolify Deployment Summary

## Files Created/Modified

### Docker Configuration
- ✅ `Dockerfile` - Multi-stage production build
- ✅ `docker-compose.yml` - Local testing and deployment
- ✅ `.dockerignore` - Optimized build context

### Application Configuration
- ✅ `next.config.js` - Updated for standalone output
- ✅ `app/api/health/route.ts` - Health check endpoint

### Documentation
- ✅ `COOLIFY_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- ✅ `DEPLOYMENT_SUMMARY.md` - This file

## Next Steps for Coolify Deployment

1. **Update Environment Variables**
   - Edit `.env.production` with your actual credentials
   - Ensure all required variables are set

2. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Coolify deployment"
   git push origin main
   ```

3. **Deploy to Coolify**
   - Follow the guide in `COOLIFY_DEPLOYMENT_GUIDE.md`
   - Configure environment variables in Coolify dashboard
   - Set up domain and SSL

4. **Verify Deployment**
   - Check health endpoint: `https://your-domain.com/api/health`
   - Test application functionality
   - Monitor logs and performance

## Environment Variables Required

Make sure these are configured in Coolify:

- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `FLUTTER_WAVE_HASH`, `RAVE_LIVE_PUBLIC_KEY`, `RAVE_LIVE_SECRET_KEY`
- `RESEND_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `TZ=Africa/Lagos`

## Health Check

The application includes a health check endpoint at `/api/health` that:
- Tests database connectivity
- Returns application status
- Provides environment information

## Support

If you encounter issues:
1. Check the troubleshooting section in `COOLIFY_DEPLOYMENT_GUIDE.md`
2. Review application logs in Coolify dashboard
3. Test locally with Docker Compose
EOF

    print_success "Deployment summary generated"
}

# Main execution
main() {
    echo "=========================================="
    echo "  ReadNWin Coolify Deployment Preparation"
    echo "=========================================="
    echo ""
    
    check_docker
    check_docker_compose
    check_env_file
    build_docker_image
    test_docker_container
    test_docker_compose
    generate_summary
    
    echo ""
    echo "=========================================="
    print_success "Deployment preparation completed!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update .env.production with your actual credentials"
    echo "2. Push changes to your Git repository"
    echo "3. Follow the guide in COOLIFY_DEPLOYMENT_GUIDE.md"
    echo "4. Deploy to Coolify"
    echo ""
    echo "For detailed instructions, see: COOLIFY_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@" 