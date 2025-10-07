#!/bin/bash

# CertiKAS Project Initialization Script
# Sets up the development environment

set -e

echo "🛡️  CertiKAS Project Initialization"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required${NC}"
    echo "   Current version: $(node --version)"
    echo "   Please upgrade: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
echo "📦 Checking npm..."
npm --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env if it doesn't exist
echo ""
echo "⚙️  Configuring environment..."

if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env

    # Set defaults for development
    echo "" >> .env
    echo "# Development defaults" >> .env
    echo "MOCK_BLOCKCHAIN=true" >> .env
    echo "NODE_ENV=development" >> .env
    echo "PORT=3000" >> .env

    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please review and update .env with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create logs directory
echo ""
echo "📁 Setting up directories..."
mkdir -p logs
mkdir -p storage
echo -e "${GREEN}✅ Directories created${NC}"

# Check git
echo ""
echo "🔧 Checking git configuration..."
if [ -d .git ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Git not initialized${NC}"
    read -p "Initialize git repository? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    fi
fi

# Test server
echo ""
echo "🧪 Testing server startup..."
timeout 5 npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Check if server started
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Server starts successfully${NC}"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "   Check logs for errors"
fi

# Summary
echo ""
echo "========================================"
echo "🎉 CertiKAS Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Review .env configuration:"
echo "   ${GREEN}nano .env${NC}"
echo ""
echo "2. Start development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open in browser:"
echo "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo "4. Read documentation:"
echo "   - README.md - Project overview"
echo "   - QUICKSTART.md - 5-minute guide"
echo "   - DEPLOYMENT_GUIDE.md - Production deployment"
echo "   - docs/API.md - API reference"
echo ""
echo "5. Deploy to production:"
echo "   ${GREEN}./scripts/deploy.sh --production${NC}"
echo ""
echo "========================================"
echo ""
echo "📚 Documentation: ~/claude-projects/CertiKAS/docs/"
echo "🐛 Issues: https://github.com/YOUR_USERNAME/certikas/issues"
echo "💬 Discord: https://discord.gg/certikas"
echo ""
echo "Fight fake news with blockchain! 🛡️"
echo ""
