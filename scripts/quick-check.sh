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

echo -e "${YELLOW}🔍 Rust formatting...${NC}"
cd rust-core && cargo fmt --check
check_status "Format check"

echo -e "${YELLOW}🔍 Rust clippy...${NC}"
cargo clippy --all-targets --all-features -- -D warnings
check_status "Clippy"

echo -e "${YELLOW}🔍 Rust tests...${NC}"
cargo test
check_status "Tests"

echo -e "${YELLOW}🔍 Building NAPI...${NC}"
npx napi build --release
check_status "NAPI build"

cd ..

echo -e "${GREEN}✨ Quick validation passed! ✨${NC}"
