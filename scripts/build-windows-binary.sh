#!/bin/bash

# Windows Binary Build Script for SoloPDF CLI
# This script integrates Windows cross-compilation into the build flow

set -e

echo "🪟 WINDOWS BINARY BUILD SCRIPT"
echo "═══════════════════════════════════════"
echo ""

# Check if we're running in GitHub Actions
if [[ "${GITHUB_ACTIONS}" == "true" ]]; then
    echo "🚀 Running in GitHub Actions - Windows Runner"
    WINDOWS_MODE="ci"
else
    echo "💻 Running locally - Will prepare for CI build"
    WINDOWS_MODE="local"
fi

echo "📁 Working Directory: $(pwd)"
echo "🔧 Build Mode: $WINDOWS_MODE"
echo ""

# Function to create platform package structure
create_windows_package() {
    local binary_path="$1"
    local version="$2"
    
    echo "📦 Creating Windows platform package..."
    
    # Create package directory
    local package_dir="platform-packages/solopdf-cli-win32-x64-msvc"
    mkdir -p "$package_dir"
    
    # Create package.json
    cat > "$package_dir/package.json" << EOF
{
  "name": "solopdf-cli-win32-x64-msvc",
  "version": "$version",
  "description": "SoloPDF CLI native binary for win32-x64-msvc",
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
  "cpu": ["x64"],
  "os": ["win32"]
}
EOF

    # Copy the binary if it exists
    if [[ -f "$binary_path" ]]; then
        cp "$binary_path" "$package_dir/index.node"
        local size=$(stat -c%s "$package_dir/index.node" 2>/dev/null || stat -f%z "$package_dir/index.node" 2>/dev/null)
        echo "✅ Windows binary copied: ${size} bytes"
        return 0
    else
        echo "⚠️  Binary not found at: $binary_path"
        # Create placeholder for local development
        echo "// Cross-compilation needed - will be built in CI" > "$package_dir/index.node"
        echo "📝 Placeholder created for CI build"
        return 1
    fi
}

# Get version from package.json
VERSION=$(node -p "require('./node-wrapper/package.json').version" 2>/dev/null || echo "1.2.0")
echo "📋 Package Version: $VERSION"

if [[ "$WINDOWS_MODE" == "ci" ]]; then
    echo ""
    echo "🔨 BUILDING WINDOWS BINARY IN CI..."
    
    # Ensure we're in the right directory
    cd rust-core
    
    # Install dependencies
    echo "📥 Installing npm dependencies..."
    npm install
    
    # Build for Windows target
    echo "🔧 Building Windows binary with NAPI..."
    npx napi build --release --platform --target x86_64-pc-windows-msvc
    
    # Find the generated binary
    WINDOWS_BINARY=""
    for candidate in "index.win32-x64-msvc.node" "solopdf_cli.win32-x64-msvc.node" "*.win32-x64-msvc.node"; do
        if [[ -f "$candidate" ]]; then
            WINDOWS_BINARY="$candidate"
            break
        fi
    done
    
    if [[ -z "$WINDOWS_BINARY" ]]; then
        # Try generic node file
        if [[ -f "index.node" ]]; then
            WINDOWS_BINARY="index.node"
        else
            echo "❌ No Windows binary found after build"
            echo "📁 Available files:"
            ls -la *.node 2>/dev/null || echo "No .node files found"
            exit 1
        fi
    fi
    
    echo "✅ Windows binary found: $WINDOWS_BINARY"
    
    # Go back to root and create package
    cd ..
    create_windows_package "rust-core/$WINDOWS_BINARY" "$VERSION"
    
else
    echo ""
    echo "💡 LOCAL MODE - PREPARING FOR CI BUILD..."
    echo ""
    echo "Current status:"
    
    # Check if Windows binary already exists
    WINDOWS_PACKAGE_DIR="platform-packages/solopdf-cli-win32-x64-msvc"
    if [[ -f "$WINDOWS_PACKAGE_DIR/index.node" ]]; then
        size=$(stat -c%s "$WINDOWS_PACKAGE_DIR/index.node" 2>/dev/null || stat -f%z "$WINDOWS_PACKAGE_DIR/index.node" 2>/dev/null)
        if [[ "$size" -gt 1000000 ]]; then
            echo "✅ Windows binary already exists (${size} bytes)"
            echo "🎉 No CI build needed!"
            exit 0
        else
            echo "⚠️  Placeholder exists (${size} bytes)"
        fi
    else
        echo "❌ No Windows package found"
    fi
    
    # Create placeholder structure for CI
    create_windows_package "" "$VERSION"
    
    echo ""
    echo "📋 NEXT STEPS FOR WINDOWS BINARY:"
    echo "1. 🚀 Push changes to GitHub: git push origin main"
    echo "2. 🔍 Monitor GitHub Actions: https://github.com/soloflow-ai/solopdf-cli/actions"
    echo "3. 📥 CI will automatically build Windows binary"
    echo "4. ✅ Binary will be integrated into platform packages"
    echo ""
    echo "💡 The GitHub Actions workflow will:"
    echo "   • Build on windows-latest runner"
    echo "   • Compile Rust code for x86_64-pc-windows-msvc"
    echo "   • Create platform-specific npm package"
    echo "   • Upload as build artifact"
fi

echo ""
echo "🎯 Windows build script completed successfully!"
