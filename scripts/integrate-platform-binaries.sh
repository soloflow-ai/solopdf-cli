#!/bin/bash

# Windows Binary Integration - Direct Approach
# This script integrates the Windows build process with a simpler flow

set -e

echo "🪟 WINDOWS BINARY DIRECT INTEGRATION"
echo "═══════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get version from package.json
VERSION=$(node -p "require('./node-wrapper/package.json').version" 2>/dev/null || echo "1.2.0")

echo -e "${BLUE}📋 Package Version: $VERSION${NC}"
echo ""

# Function to create/update platform package
update_platform_package() {
    local platform="$1"
    local binary_path="$2"
    local version="$3"
    
    echo -e "${YELLOW}📦 Updating $platform platform package...${NC}"
    
    local package_dir="platform-packages/solopdf-cli-$platform"
    mkdir -p "$package_dir"
    
    # Create package.json with correct metadata
    case "$platform" in
        "win32-x64-msvc")
            cpu='["x64"]'
            os='["win32"]'
            ;;
        "linux-x64-gnu")
            cpu='["x64"]'
            os='["linux"]'
            ;;
        "darwin-x64")
            cpu='["x64"]'
            os='["darwin"]'
            ;;
        "darwin-arm64")
            cpu='["arm64"]'
            os='["darwin"]'
            ;;
        *)
            cpu='[]'
            os='[]'
            ;;
    esac
    
    cat > "$package_dir/package.json" << EOF
{
  "name": "solopdf-cli-$platform",
  "version": "$version",
  "description": "SoloPDF CLI native binary for $platform",
  "main": "index.node",
  "files": ["index.node"],
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/soloflow-ai/solopdf-cli.git"
  },
  "publishConfig": {
    "access": "public"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "cpu": $cpu,
  "os": $os
}
EOF

    # Copy binary if it exists
    if [[ -f "$binary_path" ]]; then
        cp "$binary_path" "$package_dir/index.node"
        local size=$(stat -c%s "$package_dir/index.node" 2>/dev/null || stat -f%z "$package_dir/index.node" 2>/dev/null)
        echo -e "${GREEN}   ✅ Binary copied: ${size} bytes${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Binary not found, creating placeholder${NC}"
        echo "// Cross-compilation needed - will be built in CI" > "$package_dir/index.node"
    fi
}

echo -e "${BLUE}🔍 Current binary status:${NC}"

# Check existing binaries in rust-core
if [[ -f "rust-core/index.linux-x64-gnu.node" ]]; then
    size=$(stat -c%s "rust-core/index.linux-x64-gnu.node" 2>/dev/null || stat -f%z "rust-core/index.linux-x64-gnu.node" 2>/dev/null)
    echo -e "${GREEN}✅ Linux binary: ${size} bytes${NC}"
    update_platform_package "linux-x64-gnu" "rust-core/index.linux-x64-gnu.node" "$VERSION"
else
    echo -e "${RED}❌ Linux binary missing${NC}"
    update_platform_package "linux-x64-gnu" "" "$VERSION"
fi

# Look for platform-specific binaries
for platform in win32-x64-msvc darwin-x64 darwin-arm64; do
    binary_file="rust-core/index.${platform}.node"
    if [[ -f "$binary_file" ]]; then
        size=$(stat -c%s "$binary_file" 2>/dev/null || stat -f%z "$binary_file" 2>/dev/null)
        echo -e "${GREEN}✅ $platform binary: ${size} bytes${NC}"
        update_platform_package "$platform" "$binary_file" "$VERSION"
    else
        echo -e "${YELLOW}⚠️  $platform binary: Not available locally${NC}"
        update_platform_package "$platform" "" "$VERSION"
    fi
done

echo ""
echo -e "${BLUE}📊 Platform Package Summary:${NC}"

total_ready=0
total_packages=4

for platform in linux-x64-gnu win32-x64-msvc darwin-x64 darwin-arm64; do
    package_file="platform-packages/solopdf-cli-$platform/index.node"
    if [[ -f "$package_file" ]]; then
        size=$(stat -c%s "$package_file" 2>/dev/null || stat -f%z "$package_file" 2>/dev/null)
        if [[ "$size" -gt 1000000 ]]; then
            echo -e "${GREEN}   ✅ $platform: READY (${size}B)${NC}"
            total_ready=$((total_ready + 1))
        else
            echo -e "${YELLOW}   ⚠️  $platform: PLACEHOLDER (${size}B)${NC}"
        fi
    else
        echo -e "${RED}   ❌ $platform: MISSING${NC}"
    fi
done

echo ""
echo -e "${BLUE}🎯 Readiness: $total_ready/$total_packages platforms ready${NC}"

if [[ "$total_ready" -eq "$total_packages" ]]; then
    echo -e "${GREEN}🎉 ALL PLATFORMS READY FOR PRODUCTION!${NC}"
    echo -e "${GREEN}📦 Ready to publish to npm${NC}"
elif [[ "$total_ready" -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  PARTIAL READINESS${NC}"
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "   1. 🚀 Push to GitHub to trigger CI builds"
    echo "   2. 📥 Wait for cross-platform compilation"
    echo "   3. 📦 Integrate CI artifacts"
    echo "   4. ✅ Validate all platforms ready"
else
    echo -e "${RED}❌ NO PLATFORMS READY${NC}"
    echo -e "${RED}📋 Next steps:${NC}"
    echo "   1. 🔧 Fix local build environment"
    echo "   2. 📥 Build at least one platform locally"
    echo "   3. 🚀 Set up CI for cross-compilation"
fi

echo ""
echo -e "${BLUE}✅ Platform binary integration completed!${NC}"

# Exit successfully - this is a status/integration script, not a build requirement
exit 0
