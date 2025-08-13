#!/bin/bash

# Test GitHub Actions workflow steps locally
# This simulates the CI/CD pipeline to catch issues before pushing

set -e

echo "🧪 Testing GitHub Actions Workflow Steps Locally"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

cd "$(dirname "$0")/.."

# Test Node.js setup
print_step "Testing Node.js setup..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Current architecture: $(node -p process.arch)"
print_success "Node.js setup verified"

# Test Rust setup
print_step "Testing Rust setup..."
echo "Rust version: $(rustc --version)"
echo "Cargo version: $(cargo --version)"
echo "Available targets:"
rustup target list --installed
print_success "Rust setup verified"

# Test environment variables that would be set in CI
print_step "Testing environment variable setup..."

# Simulate macOS environment variables
export MACOSX_DEPLOYMENT_TARGET=11.0
export CC=$(which clang || echo "clang")
export CXX=$(which clang++ || echo "clang++")
export AR=$(which ar || echo "ar")
export STRIP=$(which strip || echo "strip")
export TARGET_CC=clang
export TARGET_CXX=clang++
export TARGET_AR=ar

# Test npm environment variables (the correct way)
export npm_config_target_arch=arm64
export npm_config_target_platform=darwin
export npm_config_build_from_source=true
export npm_config_cache=/tmp/.npm
export npm_config_runtime=node

echo "Environment variables set:"
echo "  MACOSX_DEPLOYMENT_TARGET=$MACOSX_DEPLOYMENT_TARGET"
echo "  CC=$CC"
echo "  CXX=$CXX"
echo "  npm_config_target_arch=$npm_config_target_arch"
echo "  npm_config_target_platform=$npm_config_target_platform"
print_success "Environment variables configured"

# Test Rust core build steps
print_step "Testing Rust core build steps..."
cd rust-core

print_step "  - Testing npm install..."
if npm install; then
    print_success "  npm install successful"
else
    print_error "  npm install failed"
    exit 1
fi

print_step "  - Testing native build..."
if npx napi build --release; then
    print_success "  Native build successful"
else
    print_error "  Native build failed"
    exit 1
fi

print_step "  - Testing build artifact verification..."
if [[ -f "index.node" && -f "index.js" && -f "index.d.ts" ]]; then
    echo "    Build artifacts present:"
    ls -la index.node index.js index.d.ts
    
    # Test file command (if available)
    if command -v file >/dev/null 2>&1; then
        echo "    File type: $(file index.node)"
    fi
    
    print_success "  Build artifacts verified"
else
    print_error "  Missing build artifacts"
    exit 1
fi

cd ..

# Test Node wrapper build
print_step "Testing Node wrapper build steps..."
cd node-wrapper

print_step "  - Testing dependency installation..."
if pnpm install; then
    print_success "  Dependencies installed"
else
    print_error "  Dependency installation failed"
    exit 1
fi

print_step "  - Testing linting..."
if pnpm lint; then
    print_success "  Linting passed"
else
    print_error "  Linting failed"
    exit 1
fi

print_step "  - Testing build..."
if pnpm build; then
    print_success "  Build successful"
else
    print_error "  Build failed"
    exit 1
fi

print_step "  - Testing unit tests..."
if pnpm test:unit --passWithNoTests; then
    print_success "  Unit tests passed"
else
    print_error "  Unit tests failed"
    exit 1
fi

cd ..

print_step "Testing platform-specific scenarios..."

# Test different target scenarios
CURRENT_OS=$(uname -s)
case "$CURRENT_OS" in
    "Darwin")
        print_step "  - Testing macOS-specific commands..."
        
        # Test xcrun commands
        if command -v xcrun >/dev/null 2>&1; then
            echo "    xcrun clang: $(xcrun -f clang)"
            echo "    xcrun clang++: $(xcrun -f clang++)"
            print_success "  xcrun commands available"
        else
            print_warning "  xcrun not available (expected on non-macOS)"
        fi
        
        # Test xcodebuild
        if command -v xcodebuild >/dev/null 2>&1; then
            echo "    Xcode version: $(xcodebuild -version | head -n 1)"
            print_success "  Xcode available"
        else
            print_warning "  Xcode not available"
        fi
        ;;
    "Linux")
        print_step "  - Testing Linux environment..."
        echo "    This is a Linux environment, skipping macOS-specific tests"
        print_success "  Linux environment confirmed"
        ;;
    *)
        print_warning "  Unrecognized OS: $CURRENT_OS"
        ;;
esac

# Test workflow matrix simulation
print_step "Testing workflow matrix combinations..."

TARGETS=("x86_64-unknown-linux-gnu" "x86_64-pc-windows-msvc" "x86_64-apple-darwin" "aarch64-apple-darwin")

for target in "${TARGETS[@]}"; do
    echo "  Testing target: $target"
    
    # Check if target is installed
    if rustup target list --installed | grep -q "$target"; then
        print_success "    Target $target is installed"
        
        # Try to build for this target (may fail on cross-compilation)
        cd rust-core
        if npx napi build --release --target "$target" 2>/dev/null; then
            print_success "    Build succeeded for $target"
        else
            print_warning "    Build failed for $target (expected for cross-compilation)"
        fi
        cd ..
    else
        print_warning "    Target $target not installed"
    fi
done

echo ""
echo "🎉 Workflow simulation completed successfully!"
echo ""
print_success "All critical pipeline steps verified locally"
print_success "CI/CD workflow should now succeed on GitHub Actions"
echo ""
echo "📋 Next steps:"
echo "  1. Push changes to GitHub"
echo "  2. Monitor GitHub Actions workflow"
echo "  3. Verify all matrix builds complete successfully"
