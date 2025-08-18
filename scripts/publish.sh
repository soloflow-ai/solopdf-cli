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

# Function to show usage
show_usage() {
    echo "Usage: $0 [major|minor|patch|current]"
    echo ""
    echo "Options:"
    echo "  major    - Bump major version (1.0.0 -> 2.0.0)"
    echo "  minor    - Bump minor version (1.0.0 -> 1.1.0)"
    echo "  patch    - Bump patch version (1.0.0 -> 1.0.1)"
    echo "  current  - Publish current version without bumping"
    echo ""
    echo "If no option is provided, 'current' is assumed."
}

# Parse command line argument
VERSION_BUMP=${1:-current}

case $VERSION_BUMP in
    major|minor|patch|current)
        ;;
    -h|--help)
        show_usage
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option: $VERSION_BUMP${NC}"
        show_usage
        exit 1
        ;;
esac

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

# Handle version bumping
if [[ $VERSION_BUMP != "current" ]]; then
    echo -e "${YELLOW}⬆️ Bumping $VERSION_BUMP version...${NC}"
    cd node-wrapper
    npm version $VERSION_BUMP --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    cd ..
    
    # Update root package.json to match
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        pkg.version = '$NEW_VERSION';
        fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    echo -e "${GREEN}✅ Version bumped from ${CURRENT_VERSION} to ${NEW_VERSION}${NC}"
    PUBLISH_VERSION=$NEW_VERSION
else
    PUBLISH_VERSION=$CURRENT_VERSION
    echo -e "${BLUE}📦 Publishing current version: ${PUBLISH_VERSION}${NC}"
fi

# Run full validation
echo -e "${YELLOW}🔍 Running full validation...${NC}"
./scripts/validate-for-publish.sh

# Ask for confirmation
echo -e "${YELLOW}🤔 Ready to publish version ${PUBLISH_VERSION}?${NC}"
echo "This will:"
echo "  1. Create a git tag v${PUBLISH_VERSION}"
echo "  2. Push to GitHub"
echo "  3. Publish to npm"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Publishing cancelled${NC}"
    exit 0
fi

# Commit version changes if any
if [[ $VERSION_BUMP != "current" ]]; then
    echo -e "${YELLOW}💾 Committing version changes...${NC}"
    git add package.json node-wrapper/package.json
    git commit -m "chore: bump version to ${PUBLISH_VERSION}"
fi

# Create and push git tag
echo -e "${YELLOW}🏷️  Creating git tag v${PUBLISH_VERSION}...${NC}"
git tag "v${PUBLISH_VERSION}"

echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
git push
git push --tags

echo -e "${YELLOW}📦 Publishing to npm...${NC}"
cd node-wrapper
npm publish

echo -e "${GREEN}🎉 Successfully published SoloPDF CLI v${PUBLISH_VERSION}! 🎉${NC}"
echo ""
echo "📋 What happened:"
echo "  ✅ Created git tag v${PUBLISH_VERSION}"
echo "  ✅ Pushed to GitHub"
echo "  ✅ Published to npm"
echo ""
echo "🔗 Links:"
echo "  📦 npm: https://www.npmjs.com/package/solopdf-cli"
echo "  🐙 GitHub: https://github.com/soloflow-ai/solopdf-cli"
