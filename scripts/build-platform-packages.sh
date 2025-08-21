#!/bin/bash
set -e

echo "🔧 Building platform-specific packages with actual binaries..."

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get version from package.json
VERSION=$(node -p "require('./node-wrapper/package.json').version")
echo -e "${BLUE}📦 Version: ${VERSION}${NC}"

# Build targets and their corresponding platform names  
declare -A TARGETS=(
  ["x86_64-unknown-linux-gnu"]="linux-x64-gnu"
  ["x86_64-pc-windows-msvc"]="win32-x64-msvc"
  ["x86_64-apple-darwin"]="darwin-x64"
  ["aarch64-apple-darwin"]="darwin-arm64"
)

# Clean and create platform packages directory
echo -e "${YELLOW}🏗️  Cleaning and creating platform packages directory...${NC}"
rm -rf platform-packages
mkdir -p platform-packages

# Set up Rust environment
cd rust-core
echo -e "${CYAN}📦 Installing Rust dependencies...${NC}"
source ~/.cargo/env 2>/dev/null || true
npm install

# Build each target and create platform package
for target in "${!TARGETS[@]}"; do
  platform="${TARGETS[$target]}"
  package_name="solopdf-cli-$platform"
  
  echo -e "${CYAN}🏗️  Building $platform ($target)...${NC}"
  
  # Build the binary for this target
  if npx napi build --release --platform --target "$target" 2>/dev/null; then
    echo -e "${GREEN}✅ Successfully built $target${NC}"
    
    # Create platform package directory
    mkdir -p "../platform-packages/$package_name"
    cd "../platform-packages/$package_name"
    
    # Create package.json with proper metadata
    cat > package.json << EOF
{
  "name": "$package_name",
  "version": "$VERSION",
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
  }
EOF

    # Add platform-specific metadata
    case "$platform" in
      "win32-x64-msvc")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["win32"]' >> package.json
        ;;
      "linux-x64-gnu")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["linux"]' >> package.json
        ;;
      "darwin-x64")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["darwin"]' >> package.json
        ;;
      "darwin-arm64")
        echo '  ,"cpu": ["arm64"],' >> package.json
        echo '  "os": ["darwin"]' >> package.json
        ;;
    esac
    
    echo "}" >> package.json
    
    # Find and copy the correct binary file
    NODE_FILE=$(find "../../rust-core" -name "*${platform}.node" -type f 2>/dev/null | head -1)
    if [ -z "$NODE_FILE" ]; then
      # Try generic patterns
      NODE_FILE=$(find "../../rust-core" -name "index.node" -type f 2>/dev/null | head -1)
    fi
    
    if [ -n "$NODE_FILE" ] && [ -f "$NODE_FILE" ]; then
      cp "$NODE_FILE" index.node
      size=$(stat -f%z index.node 2>/dev/null || stat -c%s index.node 2>/dev/null || echo "0")
      echo -e "${GREEN}✅ Copied binary: $(basename "$NODE_FILE") -> index.node (${size} bytes)${NC}"
    else
      echo -e "${RED}❌ No binary found for $platform${NC}"
      # Create a placeholder to prevent npm publish errors
      echo "// Placeholder - binary not available for local build" > index.node
    fi
    
    cd "../../rust-core"
    
  else
    echo -e "${YELLOW}⚠️  Failed to build $target locally (cross-compilation needed)${NC}"
    
    # Create package directory anyway with placeholder
    mkdir -p "../platform-packages/$package_name"  
    cd "../platform-packages/$package_name"
    
    cat > package.json << EOF
{
  "name": "$package_name",
  "version": "$VERSION",
  "description": "SoloPDF CLI native binary for $platform (requires CI build)",
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
  }
EOF

    # Add platform-specific metadata for placeholders too
    case "$platform" in
      "win32-x64-msvc")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["win32"]' >> package.json
        ;;
      "linux-x64-gnu")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["linux"]' >> package.json
        ;;
      "darwin-x64")
        echo '  ,"cpu": ["x64"],' >> package.json
        echo '  "os": ["darwin"]' >> package.json
        ;;
      "darwin-arm64")
        echo '  ,"cpu": ["arm64"],' >> package.json
        echo '  "os": ["darwin"]' >> package.json
        ;;
    esac
    
    echo "}" >> package.json
    
    echo "// Cross-compilation needed - will be built in CI" > index.node
    echo -e "${YELLOW}⚠️  Platform $platform requires CI/cross-compilation${NC}"
    
    cd "../../rust-core"
  fi
done

cd ..

echo ""
echo -e "${BLUE}📊 Platform package summary:${NC}"
for target in "${!TARGETS[@]}"; do
  platform="${TARGETS[$target]}"
  package_name="solopdf-cli-$platform"
  
  if [ -f "platform-packages/$package_name/index.node" ]; then
    size=$(stat -f%z "platform-packages/$package_name/index.node" 2>/dev/null || stat -c%s "platform-packages/$package_name/index.node" 2>/dev/null || echo "0")
    if [ "$size" -gt 1000000 ]; then
      echo -e "${GREEN}✅ $package_name: $(echo "scale=1; $size/1024/1024" | bc 2>/dev/null || echo "$size/1024/1024" | awk '{printf "%.1f", $1}')MB${NC}"
    elif [ "$size" -gt 1000 ]; then
      echo -e "${YELLOW}⚠️  $package_name: $(echo "scale=1; $size/1024" | bc 2>/dev/null || echo "$size/1024" | awk '{printf "%.1f", $1}')KB (placeholder)${NC}"
    else
      echo -e "${YELLOW}⚠️  $package_name: ${size} bytes (placeholder)${NC}"
    fi
  else
    echo -e "${RED}❌ $package_name: missing${NC}"
  fi
done

# Optionally publish packages
if [ "$1" = "--publish" ] && [ -n "$NPM_TOKEN" ]; then
  echo ""
  echo -e "${YELLOW}🚀 Publishing platform packages to npm...${NC}"
  
  for target in "${!TARGETS[@]}"; do
    platform="${TARGETS[$target]}"
    package_name="solopdf-cli-$platform"
    package_dir="platform-packages/$package_name"
    
    if [ -f "$package_dir/index.node" ]; then
      size=$(stat -f%z "$package_dir/index.node" 2>/dev/null || stat -c%s "$package_dir/index.node" 2>/dev/null || echo "0")
      
      if [ "$size" -gt 1000000 ]; then  # Only publish if binary is substantial (>1MB)
        echo -e "${CYAN}📦 Publishing $package_name...${NC}"
        cd "$package_dir"
        if npm publish 2>/dev/null; then
          echo -e "${GREEN}✅ Published: $package_name${NC}"
        else
          echo -e "${RED}❌ Failed to publish: $package_name${NC}"
        fi
        cd "../.."
      else
        echo -e "${YELLOW}⚠️  Skipping $package_name (placeholder binary)${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  Skipping $package_name (no binary)${NC}"
    fi
  done
fi

echo ""
echo -e "${GREEN}🎉 Platform packages build complete!${NC}"
echo -e "${BLUE}📝 Note: Cross-platform binaries (Windows, macOS) require GitHub Actions.${NC}"
echo -e "${BLUE}🚀 Local Linux binary should be ready for testing.${NC}"

if [ "$1" != "--publish" ]; then
  echo -e "${CYAN}💡 Tip: Run with --publish flag to publish to NPM (requires NPM_TOKEN)${NC}"
fi
