# Coolify Deployment Quick Reference

## 🚀 Quick Start Commands

### 1. Prepare for Deployment
```bash
# Run the preparation script
./deploy-coolify.sh

# Or manually:
docker build -t readnwin-app:latest .
docker-compose up -d
```

### 2. Test Locally
```bash
# Test with Docker
docker run -d --name readnwin-test --env-file .env.production -p 3000:3000 readnwin-app:latest

# Test with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

### 3. Deploy to Coolify
1. Push code to Git repository
2. Connect repository in Coolify dashboard
3. Configure environment variables
4. Deploy

## 🔧 Essential Configuration

### Environment Variables (Required in Coolify)
```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
FLUTTER_WAVE_HASH=your-flutterwave-hash
RAVE_LIVE_PUBLIC_KEY=your-rave-public-key
RAVE_LIVE_SECRET_KEY=your-rave-secret-key
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
TZ=Africa/Lagos
```

### Coolify Settings
- **Build Pack**: Docker
- **Port**: 3000
- **Health Check Path**: `/api/health`
- **Health Check Interval**: 30s
- **Health Check Timeout**: 10s
- **Health Check Retries**: 3

## 🐳 Docker Commands

### Build Image
```bash
docker build -t readnwin-app:latest .
```

### Run Container
```bash
docker run -d \
  --name readnwin-app \
  --env-file .env.production \
  -p 3000:3000 \
  readnwin-app:latest
```

### Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Health Check

### Test Health Endpoint
```bash
curl https://your-domain.com/api/health
```

### Expected Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Dockerfile syntax
docker build -t test-image .

# Check dependencies
npm install
```

#### Database Connection Issues
```bash
# Test database connection
docker exec <container-id> node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
pool.query('SELECT 1').then(() => console.log('DB OK')).catch(console.error);
"
```

#### Environment Variable Issues
```bash
# Check environment variables
docker exec <container-id> env | grep -E "(DB_|NEXTAUTH_|NODE_ENV)"
```

### Debug Commands
```bash
# View container logs
docker logs <container-id>

# Enter container shell
docker exec -it <container-id> sh

# Check container status
docker ps -a
```

## 📊 Monitoring

### Application Endpoints
- **Health Check**: `/api/health`
- **Books API**: `/api/books`
- **Main App**: `/`

### Log Locations
- **Coolify Dashboard**: Application logs
- **Container Logs**: `docker logs <container-id>`
- **Application Logs**: Console output in container

## 🔄 Deployment Workflow

### 1. Development
```bash
# Make changes to code
git add .
git commit -m "Update for deployment"
git push origin main
```

### 2. Coolify Deployment
1. Coolify detects changes
2. Builds new Docker image
3. Deploys new container
4. Runs health checks
5. Switches traffic to new version

### 3. Verification
```bash
# Check health
curl https://your-domain.com/api/health

# Test application
curl https://your-domain.com/api/books
```

## 📁 File Structure

```
readnwinnext2/
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local testing and deployment
├── .dockerignore             # Optimized build context
├── next.config.js            # Next.js configuration (standalone output)
├── app/api/health/route.ts   # Health check endpoint
├── COOLIFY_DEPLOYMENT_GUIDE.md # Complete deployment guide
├── COOLIFY_QUICK_REFERENCE.md # This file
├── deploy-coolify.sh         # Deployment preparation script
└── .env.production           # Production environment variables
```

## 🆘 Emergency Commands

### Restart Application
```bash
# In Coolify dashboard: Redeploy
# Or manually:
docker restart <container-id>
```

### Rollback
```bash
# In Coolify dashboard: Rollback to previous version
# Or manually:
docker tag <previous-image> readnwin-app:latest
docker restart <container-id>
```

### Check Status
```bash
# Application status
curl -f https://your-domain.com/api/health

# Container status
docker ps

# Resource usage
docker stats
```

## 📞 Support

- **Documentation**: `COOLIFY_DEPLOYMENT_GUIDE.md`
- **Health Check**: `/api/health`
- **Logs**: Coolify dashboard or `docker logs`
- **Issues**: Check troubleshooting section in main guide 