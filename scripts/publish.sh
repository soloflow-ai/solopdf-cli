#!/bin/bash

# Automated publish script for SoloPDF CLI
echo "🚀 Automated SoloPDF CLI Publishing"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Exit on any error
set -e

# Check if we're in a clean git state
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Git working directory is not clean. Commit your changes first.${NC}"
    echo "Uncommitted changes:"
    git status --short
    exit 1
fi

# Get the current version from package.json
CURRENT_VERSION=$(node -p "require('./node-wrapper/package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Run full validation
echo -e "${YELLOW}🔍 Running full validation...${NC}"
./scripts/validate-for-publish.sh

# Ask for confirmation
echo -e "${YELLOW}🤔 Ready to publish version ${CURRENT_VERSION}?${NC}"
echo "This will:"
echo "  1. Create a git tag v${CURRENT_VERSION}"
echo "  2. Push to GitHub"
echo "  3. Publish to npm"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Publishing cancelled${NC}"
    exit 0
fi

# Create and push git tag
echo -e "${YELLOW}🏷️  Creating git tag v${CURRENT_VERSION}...${NC}"
git tag "v${CURRENT_VERSION}"

echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
git push
git push --tags

echo -e "${YELLOW}📦 Publishing to npm...${NC}"
cd node-wrapper
npm publish

echo -e "${GREEN}🎉 Successfully published SoloPDF CLI v${CURRENT_VERSION}! 🎉${NC}"
echo ""
echo "📋 What happened:"
echo "  ✅ Created git tag v${CURRENT_VERSION}"
echo "  ✅ Pushed to GitHub"
echo "  ✅ Published to npm"
echo ""
echo "🔗 Links:"
echo "  📦 npm: https://www.npmjs.com/package/solopdf-cli"
echo "  🐙 GitHub: https://github.com/soloflow-ai/solopdf-cli"
