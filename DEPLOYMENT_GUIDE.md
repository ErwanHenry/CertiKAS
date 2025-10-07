# CertiKAS Deployment Guide

Complete guide for deploying CertiKAS to production on Vercel.

---

## Prerequisites

### Required Accounts
- ✅ **GitHub account** - For code repository
- ✅ **Vercel account** - For hosting (free tier available)
- ✅ **Kaspa wallet** - For blockchain transactions (mainnet)

### Development Tools
```bash
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
git --version   # v2.0 or higher
```

---

## Step 1: Prepare Repository

### Initialize Git Repository

```bash
cd ~/claude-projects/CertiKAS

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CertiKAS blockchain certification platform"
```

### Create GitHub Repository

```bash
# Option 1: Using GitHub CLI (recommended)
gh repo create certikas --public --source=. --push

# Option 2: Manual
# 1. Go to https://github.com/new
# 2. Create repository named "certikas"
# 3. Don't initialize with README (we have one)
# 4. Copy the remote URL

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/certikas.git
git branch -M main
git push -u origin main
```

---

## Step 2: Configure Environment Variables

### Create Production .env

**IMPORTANT:** Never commit `.env` to git! It's already in `.gitignore`.

### Required Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Kaspa Blockchain (PRODUCTION)
KASPA_NODE_URL=https://api.kaspa.org
KASPA_NETWORK=mainnet
KASPA_WALLET_ADDRESS=kaspa:qr... # YOUR PRODUCTION WALLET
KASPA_PRIVATE_KEY=... # YOUR PRIVATE KEY (KEEP SECRET!)

# Kasplex (Igra Token)
KASPLEX_API_URL=https://api.kasplex.org
KASPLEX_ENABLED=false # Set to true when Igra launches
IGRA_TOKEN_ADDRESS= # Will be provided when Igra launches

# Database (Optional - for future)
# DB_HOST=your-postgres-host
# DB_NAME=certikas
# DB_USER=certikas_user
# DB_PASSWORD=your-secure-password

# Redis (Optional - for future)
# REDIS_HOST=your-redis-host
# REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=YOUR_RANDOM_32_CHAR_SECRET_HERE
JWT_EXPIRATION=24h
WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://certikas.org,https://www.certikas.org
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info

# Feature Flags
FEATURE_IGRA_BRIDGE=false
FEATURE_BULK_CERTIFICATION=true
FEATURE_WEBHOOK_NOTIFICATIONS=true

# Blockchain
MOCK_BLOCKCHAIN=false # MUST be false in production
MIN_CONFIRMATIONS=6
```

---

## Step 3: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview (test first)
vercel

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `npm run build` (or leave empty)
   - Output Directory: `public`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Go to "Environment Variables" section
   - Add all variables from `.env` (see Step 2)
   - **CRITICAL:** Set `MOCK_BLOCKCHAIN=false`
   - **CRITICAL:** Add your real Kaspa wallet credentials

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get deployment URL: `https://certikas.vercel.app`

---

## Step 4: Configure Custom Domain

### Add Domain to Vercel

1. **Purchase Domain** (if you don't have one)
   - Recommended: certikas.org
   - Alternative: certikas.com, certifykaspa.com

2. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter: `certikas.org` and `www.certikas.org`

3. **Update DNS Records**
   - Go to your domain registrar (Namecheap, GoDaddy, etc.)
   - Add these DNS records:

   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   TTL: 3600

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Wait for SSL Certificate**
   - Vercel automatically provisions SSL
   - Usually takes 10-30 minutes
   - Your site will be available at `https://certikas.org`

---

## Step 5: Post-Deployment Verification

### Test Endpoints

```bash
# Health check
curl https://certikas.org/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-07T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "kaspa": {
      "connected": true,
      "network": "mainnet",
      "blockHeight": 1234567
    }
  }
}

# Blockchain health
curl https://certikas.org/api/v1/blockchain/health

# Statistics
curl https://certikas.org/api/v1/statistics
```

### Test Certification (PRODUCTION)

**⚠️ WARNING:** This will cost a small amount of KAS for transaction fees!

```bash
curl -X POST https://certikas.org/api/v1/certify/hash \
  -H "Content-Type: application/json" \
  -d '{
    "content_hash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234",
    "content_type": "article",
    "creator_wallet_address": "YOUR_KASPA_WALLET",
    "metadata": {
      "title": "Production Test Article"
    }
  }'
```

### Test Web Interface

1. Visit: https://certikas.org
2. Upload a test file
3. Certify content
4. Verify certificate appears

---

## Step 6: Monitoring & Maintenance

### Setup Vercel Monitoring

1. **Enable Analytics**
   - Go to Project → Analytics
   - Enable Web Analytics
   - Track page views, performance

2. **Configure Alerts**
   - Go to Project → Settings → Integrations
   - Add Slack/Discord webhook for deployment alerts
   - Get notified on errors

3. **Check Logs**
   ```bash
   # View real-time logs
   vercel logs https://certikas.org --follow

   # View specific deployment logs
   vercel logs [deployment-url]
   ```

### Monitor Blockchain Connection

```bash
# Check Kaspa node status
curl https://certikas.org/api/v1/blockchain/health

# If connection fails:
# 1. Check KASPA_NODE_URL is correct
# 2. Verify Kaspa network is operational
# 3. Check Vercel function logs
```

### Database Backup (Future)

When PostgreSQL is added:
```bash
# Backup database daily
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3/Backblaze
aws s3 cp backup-*.sql s3://certikas-backups/
```

---

## Step 7: Security Hardening

### Secure Environment Variables

1. **Rotate Secrets Regularly**
   - Change `JWT_SECRET` every 90 days
   - Update `WEBHOOK_SECRET` if compromised
   - **NEVER** share `KASPA_PRIVATE_KEY`

2. **Enable 2FA on Vercel**
   - Go to Account Settings → Security
   - Enable Two-Factor Authentication

3. **Review Access Logs**
   ```bash
   # Check for suspicious activity
   vercel logs --since 24h | grep "POST /api/v1/certify"
   ```

### Rate Limiting

Current limits (adjust in `.env`):
- 100 requests per 15 minutes per IP
- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

### CORS Configuration

Update `CORS_ORIGIN` in Vercel environment variables:
```
CORS_ORIGIN=https://certikas.org,https://www.certikas.org,https://app.certikas.org
```

---

## Step 8: Production Checklist

### Before Going Live

- [ ] All environment variables set in Vercel
- [ ] `MOCK_BLOCKCHAIN=false` in production
- [ ] Custom domain configured with SSL
- [ ] Health endpoint responding correctly
- [ ] Test certification successful
- [ ] Test verification working
- [ ] Kaspa wallet funded (for transaction fees)
- [ ] Logs showing no errors
- [ ] API rate limiting working
- [ ] CORS configured correctly

### After Going Live

- [ ] Create social media accounts (Twitter, Discord)
- [ ] Announce to Kaspa community
- [ ] Add site to search engines (Google Search Console)
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create support email (hello@certikas.org)
- [ ] Write launch blog post
- [ ] Share on Reddit (r/kaspa, r/cryptocurrency)

---

## Step 9: Scaling Considerations

### When to Scale

Monitor these metrics:
- API requests > 1,000/hour → Upgrade Vercel plan
- Certificates > 10,000 → Add database
- Users > 1,000 → Add caching (Redis)

### Upgrade Path

1. **Add PostgreSQL Database**
   ```bash
   # Vercel Postgres
   vercel postgres create

   # Or external (Supabase, Railway, etc.)
   ```

2. **Add Redis Caching**
   ```bash
   # Vercel KV (Redis)
   vercel kv create

   # Cache certificate lookups
   ```

3. **Add CDN for Static Assets**
   - Already handled by Vercel Edge Network
   - Consider Cloudflare for additional DDoS protection

---

## Troubleshooting

### Deployment Fails

```bash
# Check build logs
vercel logs [deployment-url]

# Common issues:
# 1. Missing environment variables → Add in Vercel dashboard
# 2. Node version mismatch → Set in package.json "engines"
# 3. Build command fails → Check package.json scripts
```

### API Returns 500 Errors

```bash
# Check function logs
vercel logs --follow

# Common causes:
# 1. Kaspa node unreachable → Check KASPA_NODE_URL
# 2. Missing environment variable → Verify all variables set
# 3. Syntax error in code → Check recent commits
```

### Blockchain Connection Issues

```bash
# Test Kaspa node directly
curl https://api.kaspa.org

# If Kaspa node is down:
# 1. Use alternative node URL
# 2. Check Kaspa Discord for status
# 3. Enable MOCK_BLOCKCHAIN temporarily
```

### High Memory Usage

```bash
# Increase Vercel function memory
# In vercel.json:
{
  "functions": {
    "src/server.js": {
      "memory": 2048  // Increase from 1024 to 2048 MB
    }
  }
}
```

---

## Cost Estimates

### Vercel Pricing

**Free Tier (Hobby):**
- ✅ 100 GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Automatic HTTPS
- ✅ Unlimited domains
- ❌ No commercial use

**Pro Tier ($20/month):**
- ✅ 1 TB bandwidth/month
- ✅ Unlimited function executions
- ✅ Analytics included
- ✅ Commercial use allowed
- **Recommended for production**

### Kaspa Transaction Fees

- ~0.0001-0.001 KAS per certification
- For 1,000 certifications/month: ~1 KAS ($0.10-$1.00)
- Very affordable!

### Domain Registration

- certikas.org: ~$12-15/year (Namecheap, GoDaddy)

### Total Monthly Cost (Estimated)

- **Hobby/MVP**: $0-2/month (domain only)
- **Production**: $20-30/month (Vercel Pro + domain)
- **Scale**: $50-100/month (Vercel Pro + database + Redis)

---

## Rollback Procedure

If deployment fails or has critical bugs:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [previous-deployment-url]

# Or in Vercel dashboard:
# Go to Deployments → Click previous deployment → "Promote to Production"
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Kaspa Docs**: https://kaspa.org/docs
- **CertiKAS GitHub**: https://github.com/YOUR_USERNAME/certikas
- **Discord**: Create support channel
- **Email**: hello@certikas.org

---

## Next Steps After Deployment

1. **Marketing Launch**
   - Tweet announcement
   - Post on Kaspa Discord
   - Share on Reddit

2. **Content Creation**
   - Write launch blog post
   - Create demo video
   - Design graphics for social media

3. **Community Building**
   - Create Discord server
   - Setup Twitter account
   - Engage with Kaspa community

4. **Feature Development**
   - Browser extension (Q1 2026)
   - Igra integration (when launched)
   - Mobile apps (Q2 2026)

---

**Congratulations! Your CertiKAS platform is now live! 🎉**

**Fighting fake news, one certificate at a time. 🛡️**
