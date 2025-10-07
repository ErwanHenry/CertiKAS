# CertiKAS Quick Start Guide

Get CertiKAS running in 5 minutes!

## Prerequisites

```bash
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
```

## Installation

### 1. Clone & Install

```bash
cd ~/claude-projects/CertiKAS
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Minimal configuration for development
NODE_ENV=development
PORT=3000

# Mock mode (no real blockchain needed)
MOCK_BLOCKCHAIN=true
KASPLEX_ENABLED=false

# For production, add:
# KASPA_WALLET_ADDRESS=your_wallet_address
# KASPA_PRIVATE_KEY=your_private_key
```

### 3. Start Development Server

```bash
npm run dev
```

Server starts at: http://localhost:3000

## First Certification

### Via Web Interface

1. Open http://localhost:3000
2. Upload a file (image, PDF, video)
3. Enter wallet address: `kaspa:qr1234567890abcdef` (mock address for testing)
4. Click "Certify Content"
5. View your certificate!

### Via API

```bash
# Certify by hash
curl -X POST http://localhost:3000/api/v1/certify/hash \
  -H "Content-Type: application/json" \
  -d '{
    "content_hash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234",
    "content_type": "article",
    "creator_wallet_address": "kaspa:qr1234567890abcdef",
    "metadata": {
      "title": "My First Article",
      "description": "Testing CertiKAS"
    }
  }'
```

## Verification

### Verify by Certificate ID

```bash
curl http://localhost:3000/api/v1/verify/cert_abc123
```

### Verify by Content Hash

```bash
curl -X POST http://localhost:3000/api/v1/verify/hash \
  -H "Content-Type: application/json" \
  -d '{
    "content_hash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234"
  }'
```

## Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "kaspa": {
      "connected": true,
      "network": "mocknet",
      "blockHeight": 1000000
    },
    "kasplex": {
      "connected": false,
      "reason": "Kasplex integration not enabled"
    }
  }
}
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues

# Deployment
npm run deploy           # Deploy to Vercel
./scripts/deploy.sh -p   # Deploy to production
```

## Next Steps

1. **Read the docs**: [docs/API.md](docs/API.md)
2. **Explore architecture**: [README.md](README.md#architecture)
3. **Join Discord**: https://discord.gg/certikas
4. **Build browser extension**: [docs/BROWSER_EXTENSION.md](docs/BROWSER_EXTENSION.md)

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Mock Blockchain Not Working

```bash
# Ensure environment variable is set
echo "MOCK_BLOCKCHAIN=true" >> .env
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables (Vercel Dashboard)

Set these in Vercel project settings:

```
NODE_ENV=production
KASPA_NODE_URL=https://api.kaspa.org
KASPA_WALLET_ADDRESS=your_production_wallet
KASPA_PRIVATE_KEY=your_production_key
MOCK_BLOCKCHAIN=false
KASPLEX_ENABLED=false
```

## Help & Support

- **Documentation**: Full docs in `/docs` folder
- **API Reference**: [docs/API.md](docs/API.md)
- **Discord**: https://discord.gg/certikas
- **GitHub Issues**: https://github.com/certikas/certikas/issues
- **Email**: hello@certikas.org

---

**You're ready to fight fake news! 🛡️**
