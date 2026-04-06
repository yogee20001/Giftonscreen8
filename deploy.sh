#!/bin/bash

# GiftOnScreen Deployment Script
# Deploys both Worker and Pages to Cloudflare

echo "🎁 GiftOnScreen Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed"
    echo "Please install it: npm install -g wrangler"
    exit 1
fi

print_status "Wrangler CLI found"

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    print_error "Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    exit 1
fi

print_status "Cloudflare authentication verified"
echo ""

# Deploy Worker
echo "📦 Deploying Gift Rendering Worker..."
cd worker
if wrangler deploy; then
    print_status "Worker deployed successfully"
else
    print_error "Worker deployment failed"
    exit 1
fi
cd ..
echo ""

# Deploy Pages
echo "🌐 Deploying Frontend to Cloudflare Pages..."
if wrangler pages deploy . --project-name=giftonscreen8; then
    print_status "Pages deployed successfully"
else
    print_error "Pages deployment failed"
    exit 1
fi

echo ""
echo "=================================="
print_status "Deployment Complete!"
echo ""
echo "Your application is available at:"
echo "  • Frontend: https://giftonscreen8.pages.dev"
echo "  • Worker: Check your Cloudflare Dashboard"
echo ""
echo "Next steps:"
echo "  1. Configure custom domain (optional)"
echo "  2. Update Supabase Auth redirect URLs"
echo "  3. Test the complete user flow"
echo ""
