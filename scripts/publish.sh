#!/bin/bash

# Smart Automated SoloPDF CLI Publishing
echo "🚀 SoloPDF CLI - Smart Publishing Tool"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Exit on any error
set -e

# Utility functions
get_next_version() {
    local current_version=$1
    local bump_type=$2
    
    # Parse version components
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $bump_type in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "${major}.$((minor + 1)).0"
            ;;
        patch)
            echo "${major}.${minor}.$((patch + 1))"
            ;;
        *)
            echo "$current_version"
            ;;
    esac
}

clean_git_state() {
    # Remove existing tags if they exist
    local tag_name=$1
    if git rev-parse "$tag_name" >/dev/null 2>&1; then
        echo -e "${YELLOW}🏷️  Removing existing tag: $tag_name${NC}"
        git tag -d "$tag_name" || true
        git push --delete origin "$tag_name" 2>/dev/null || true
    fi
}

# Check if we're in a clean git state
echo -e "${CYAN}🔍 Checking git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo
    read -p "Commit changes before publishing? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}💾 Committing changes...${NC}"
        git add .
        read -p "Enter commit message (or press Enter for 'Pre-publish changes'): " commit_msg
        commit_msg=${commit_msg:-"Pre-publish changes"}
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${RED}❌ Please commit your changes first or run with committed changes.${NC}"
        exit 1
    fi
fi

# Get the current version
CURRENT_VERSION=$(node -p "require('./node-wrapper/package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Interactive version selection
echo -e "${CYAN}🎯 Version Selection:${NC}"
echo "1. patch (${CURRENT_VERSION} → $(get_next_version $CURRENT_VERSION patch)) - Bug fixes"
echo "2. minor (${CURRENT_VERSION} → $(get_next_version $CURRENT_VERSION minor)) - New features"
echo "3. major (${CURRENT_VERSION} → $(get_next_version $CURRENT_VERSION major)) - Breaking changes"
echo "4. current (${CURRENT_VERSION}) - Publish as-is"
echo "5. custom - Enter custom version"
echo

while true; do
    read -p "Select version bump [1-5]: " choice
    case $choice in
        1)
            VERSION_BUMP="patch"
            NEW_VERSION=$(get_next_version $CURRENT_VERSION patch)
            break
            ;;
        2)
            VERSION_BUMP="minor"
            NEW_VERSION=$(get_next_version $CURRENT_VERSION minor)
            break
            ;;
        3)
            VERSION_BUMP="major"
            NEW_VERSION=$(get_next_version $CURRENT_VERSION major)
            break
            ;;
        4)
            VERSION_BUMP="current"
            NEW_VERSION=$CURRENT_VERSION
            break
            ;;
        5)
            read -p "Enter custom version (e.g., 2.1.0): " custom_version
            if [[ $custom_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                VERSION_BUMP="custom"
                NEW_VERSION=$custom_version
                break
            else
                echo -e "${RED}❌ Invalid version format. Please use semantic versioning (e.g., 1.2.3)${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please select 1-5.${NC}"
            ;;
    esac
done

echo -e "${MAGENTA}🎯 Selected: ${NEW_VERSION} (${VERSION_BUMP})${NC}"

# Update version in all files
if [[ $VERSION_BUMP != "current" ]]; then
    echo -e "${YELLOW}📝 Updating version to ${NEW_VERSION}...${NC}"
    
    # Update node-wrapper package.json
    node -e "
        const fs = require('fs');
        const pkgFile = './node-wrapper/package.json';
        const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
        pkg.version = '${NEW_VERSION}';
        fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
    "
    
    # Update root package.json
    node -e "
        const fs = require('fs');
        const pkgFile = './package.json';
        const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
        pkg.version = '${NEW_VERSION}';
        fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
    "
    
    echo -e "${GREEN}✅ Version updated from ${CURRENT_VERSION} to ${NEW_VERSION}${NC}"
    
    # Commit version changes
    echo -e "${YELLOW}💾 Committing version changes...${NC}"
    git add package.json node-wrapper/package.json
    git commit -m "chore: bump version to ${NEW_VERSION}"
    echo -e "${GREEN}✅ Version changes committed${NC}"
    
    PUBLISH_VERSION=$NEW_VERSION
else
    PUBLISH_VERSION=$CURRENT_VERSION
fi

# Run validation
echo -e "${CYAN}🔍 Running validation tests...${NC}"
if ! ./scripts/validate-for-publish.sh; then
    echo -e "${RED}❌ Validation failed! Fix issues before publishing.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All validation tests passed!${NC}"

# Final confirmation
echo
echo -e "${YELLOW}🚀 Ready to publish SoloPDF CLI v${PUBLISH_VERSION}!${NC}"
echo
echo "📋 This will:"
echo "  🏷️  Create git tag v${PUBLISH_VERSION}"
echo "  ⬆️  Push to GitHub"
echo "  📦 Publish to npm"
echo
echo -e "${CYAN}🔗 After publishing, your package will be available at:${NC}"
echo "  📦 https://www.npmjs.com/package/solopdf-cli"
echo "  🐙 https://github.com/soloflow-ai/solopdf-cli"
echo

while true; do
    read -p "Proceed with publishing? (y/N): " -n 1 -r
    echo
    case $REPLY in
        [Yy])
            break
            ;;
        [Nn]|"")
            echo -e "${YELLOW}⏹️  Publishing cancelled by user${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Please answer y or n${NC}"
            ;;
    esac
done

# Clean up any existing tags
clean_git_state "v${PUBLISH_VERSION}"

# Create and push git tag
echo -e "${YELLOW}🏷️  Creating git tag v${PUBLISH_VERSION}...${NC}"
git tag "v${PUBLISH_VERSION}"

echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
git push
git push --tags

# Build the project
echo -e "${YELLOW}� Building project...${NC}"
cd node-wrapper
npm run build

# Publish to npm
echo -e "${YELLOW}📦 Publishing to npm...${NC}"
npm publish

# Success message
echo
echo -e "${GREEN}🎉 SUCCESS! SoloPDF CLI v${PUBLISH_VERSION} published! 🎉${NC}"
echo
echo -e "${CYAN}📋 What happened:${NC}"
echo "  ✅ Created git tag v${PUBLISH_VERSION}"
echo "  ✅ Pushed to GitHub"
echo "  ✅ Published to npm"
echo
echo -e "${CYAN}🔗 Your package is now live:${NC}"
echo "  📦 npm install -g solopdf-cli"
echo "  📦 https://www.npmjs.com/package/solopdf-cli"
echo "  🐙 https://github.com/soloflow-ai/solopdf-cli/releases/tag/v${PUBLISH_VERSION}"
echo
echo -e "${MAGENTA}🚀 Happy PDF processing! 🚀${NC}"
