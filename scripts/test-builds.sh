#!/bin/bash

# Test all build targets to ensure they work before pushing

set -e

echo "🚀 Testing all build targets..."

cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test Rust formatting and linting
echo "🧹 Testing Rust code quality..."
cd rust-core

if cargo fmt --check; then
    print_status "Rust formatting check passed"
else
    print_error "Rust formatting check failed"
    exit 1
fi

if cargo clippy --all-targets --all-features -- -D warnings; then
    print_status "Rust clippy check passed"
else
    print_error "Rust clippy check failed"
    exit 1
fi

# Test Rust unit tests
echo "🧪 Running Rust unit tests..."
if cargo test --verbose; then
    print_status "Rust unit tests passed"
else
    print_error "Rust unit tests failed"
    exit 1
fi

# Test native build (current platform)
echo "🏗️  Testing native build..."
npm install
if npx napi build --release; then
    print_status "Native build successful"
else
    print_error "Native build failed"
    exit 1
fi

# Test specific targets (only if running on appropriate OS)
CURRENT_OS=$(uname -s)
case "$CURRENT_OS" in
    "Linux")
        echo "🐧 Testing Linux x64 target..."
        if npx napi build --release --target x86_64-unknown-linux-gnu; then
            print_status "Linux x64 build successful"
        else
            print_error "Linux x64 build failed"
            exit 1
        fi
        ;;
    "Darwin")
        echo "🍎 Testing macOS targets..."
        
        # Test x64 target
        if npx napi build --release --target x86_64-apple-darwin; then
            print_status "macOS x64 build successful"
        else
            print_error "macOS x64 build failed"
            exit 1
        fi
        
        # Test ARM64 target with proper environment
        echo "🍎 Testing macOS ARM64 target..."
        export MACOSX_DEPLOYMENT_TARGET=11.0
        export CC=$(which clang || echo "clang")
        export CXX=$(which clang++ || echo "clang++")
        
        if npx napi build --release --target aarch64-apple-darwin; then
            print_status "macOS ARM64 build successful"
        else
            print_warning "macOS ARM64 build failed (might need actual macOS ARM64 environment)"
        fi
        ;;
    *)
        print_warning "Skipping platform-specific builds on $CURRENT_OS"
        ;;
esac

cd ..

# Test Node.js wrapper
echo "📦 Testing Node.js wrapper..."
cd node-wrapper

# Install or update dependencies
if pnpm install; then
    print_status "Node.js dependencies installed"
else
    print_error "Node.js dependency installation failed"
    exit 1
fi

if pnpm lint; then
    print_status "Node.js linting passed"
else
    print_error "Node.js linting failed"
    exit 1
fi

if pnpm test:unit --passWithNoTests; then
    print_status "Node.js unit tests passed"
else
    print_error "Node.js unit tests failed"
    exit 1
fi

if pnpm build; then
    print_status "Node.js build successful"
else
    print_error "Node.js build failed"
    exit 1
fi

cd ..

echo ""
print_status "All tests completed successfully! 🎉"
echo ""
echo "Your changes are ready to be pushed to CI/CD."
