#!/bin/bash

# Build and publish platform packages
echo "🔧 Building and Publishing Platform Packages"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Exit on any error
set -e

# Get version from package.json
VERSION=$(node -p "require('./node-wrapper/package.json').version")
echo -e "${BLUE}📦 Version: ${VERSION}${NC}"

# Platform mappings
declare -A PLATFORMS=(
    ["linux-x64-gnu"]="x86_64-unknown-linux-gnu"
    ["win32-x64-msvc"]="x86_64-pc-windows-msvc"
    ["darwin-x64"]="x86_64-apple-darwin"
    ["darwin-arm64"]="aarch64-apple-darwin"
)

# Create platform packages directory
echo -e "${YELLOW}🏗️  Creating platform packages...${NC}"
rm -rf platform-packages
mkdir -p platform-packages

for platform in "${!PLATFORMS[@]}"; do
    target=${PLATFORMS[$platform]}
    package_name="solopdf-cli-$platform"
    package_dir="platform-packages/$package_name"
    
    echo -e "${CYAN}📦 Creating package: $package_name${NC}"
    
    mkdir -p "$package_dir"
    
    # Create package.json
    cat > "$package_dir/package.json" << EOF
{
  "name": "$package_name",
  "version": "$VERSION",
  "description": "SoloPDF CLI native binary for $platform",
  "main": "index.node",
  "files": [
    "index.node"
  ],
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/soloflow-ai/solopdf-cli.git"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "cpu": ["$(echo $platform | cut -d'-' -f2)"],
  "os": ["$(echo $platform | cut -d'-' -f1)"]
}
EOF

    # Fix CPU and OS fields for specific cases
    case $platform in
        "darwin-arm64")
            sed -i 's/"cpu": \["arm64"\]/"cpu": ["arm64"]/' "$package_dir/package.json"
            sed -i 's/"os": \["darwin"\]/"os": ["darwin"]/' "$package_dir/package.json"
            ;;
        "darwin-x64")
            sed -i 's/"cpu": \["x64"\]/"cpu": ["x64"]/' "$package_dir/package.json"
            sed -i 's/"os": \["darwin"\]/"os": ["darwin"]/' "$package_dir/package.json"
            ;;
        "win32-x64-msvc")
            sed -i 's/"cpu": \["x64"\]/"cpu": ["x64"]/' "$package_dir/package.json"
            sed -i 's/"os": \["win32"\]/"os": ["win32"]/' "$package_dir/package.json"
            ;;
        "linux-x64-gnu")
            sed -i 's/"cpu": \["x64"\]/"cpu": ["x64"]/' "$package_dir/package.json"
            sed -i 's/"os": \["linux"\]/"os": ["linux"]/' "$package_dir/package.json"
            ;;
    esac
    
    # Copy binary if it exists
    binary_file="rust-core/index.$platform.node"
    if [ -f "$binary_file" ]; then
        cp "$binary_file" "$package_dir/index.node"
        echo -e "${GREEN}✅ Binary copied: $binary_file${NC}"
    else
        echo -e "${YELLOW}⚠️  Binary not found: $binary_file (will be built in CI)${NC}"
        # Create a placeholder
        touch "$package_dir/index.node"
    fi
done

echo -e "${GREEN}✅ Platform packages created successfully!${NC}"

# Optionally publish packages
if [ "$1" = "--publish" ]; then
    echo -e "${YELLOW}🚀 Publishing platform packages to npm...${NC}"
    
    for platform in "${!PLATFORMS[@]}"; do
        package_name="solopdf-cli-$platform"
        package_dir="platform-packages/$package_name"
        
        if [ -s "$package_dir/index.node" ]; then
            echo -e "${CYAN}📦 Publishing $package_name...${NC}"
            cd "$package_dir"
            if npm publish --dry-run; then
                npm publish
                echo -e "${GREEN}✅ Published: $package_name${NC}"
            else
                echo -e "${RED}❌ Failed to publish: $package_name${NC}"
            fi
            cd ../..
        else
            echo -e "${YELLOW}⚠️  Skipping $package_name (no binary)${NC}"
        fi
    done
fi

echo -e "${GREEN}🎉 Platform packages ready!${NC}"
