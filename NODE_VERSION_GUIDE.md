# Node.js Version Management Guide

## Required Version
This project requires **Node.js 20.18.1** for optimal compatibility and performance.

## Quick Setup

### Using nvm (Recommended)
```bash
# Install the required version
nvm install 20.18.1

# Use the required version
nvm use 20.18.1

# Set as default (optional)
nvm alias default 20.18.1
```

### Automated Setup
Run our setup script:
```bash
./scripts/setup-node-version.sh
```

## Verification

Check if you're using the correct version:
```bash
npm run verify-node
```

Or manually:
```bash
node --version  # Should output v20.18.1
```

## Configuration Files

The Node.js version is specified in multiple places to ensure consistency:

- **`.nvmrc`** - For nvm users
- **`package.json`** - engines field for npm/deployment
- **`Dockerfile`** - For containerized deployments
- **`scripts/verify-node-version.js`** - Automated verification

## Troubleshooting

### Version Mismatch
If you see version warnings:
1. Run `nvm use 20.18.1`
2. Verify with `npm run verify-node`
3. If issues persist, reinstall: `nvm install 20.18.1`

### nvm Not Found
Install nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```
Then restart your terminal.

### Docker Deployment
The Dockerfile already uses the correct Node.js version (`node:20.18.1-slim`).

## Why Node.js 20.18.1?

- **Stability**: LTS version with long-term support
- **Performance**: Optimized for Next.js applications
- **Security**: Latest security patches
- **Compatibility**: Tested with all project dependencies

## Development Workflow

1. **Before starting development**:
   ```bash
   nvm use  # Uses version from .nvmrc
   npm run verify-node
   ```

2. **Before deployment**:
   - Verification runs automatically via `preinstall` script
   - Docker builds use the specified version

## CI/CD Considerations

For continuous integration, ensure your CI environment uses Node.js 20.18.1:

### GitHub Actions Example
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '20.18.1'
```

### Other CI Platforms
Refer to your platform's documentation for specifying Node.js versions.