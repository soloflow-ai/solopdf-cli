#!/bin/bash

# Quick validation script for development
echo "🔍 Quick SoloPDF CLI Validation"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}🔍 Rust checks...${NC}"
cd rust-core
source ~/.cargo/env 2>/dev/null || true
cargo fmt --check
check_status "Format check"

cargo clippy --all-targets --all-features -- -D warnings
check_status "Clippy"

cargo test
check_status "Tests"

echo -e "${YELLOW}🔍 Building Rust core...${NC}"
npm install && npx napi build --release
check_status "NAPI build"

cd ..

echo -e "${YELLOW}🔍 Node.js checks...${NC}"
cd node-wrapper
pnpm install --frozen-lockfile
check_status "Dependencies"

pnpm lint
check_status "Lint"

pnpm test
check_status "Tests"

pnpm build
check_status "Build"

cd ..

echo -e "${GREEN}✨ Quick validation passed! ✨${NC}"
