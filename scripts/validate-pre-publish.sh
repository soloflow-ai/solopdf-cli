#!/bin/bash

# Pre-publish validation script
echo "🚀 Running SoloPDF CLI Pre-Publish Validation"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 passed${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}📋 Step 1: Rust Formatting Check${NC}"
cd rust-core && cargo fmt --check
check_status "Rust formatting"

echo -e "${YELLOW}📋 Step 2: Rust Clippy${NC}"
cargo clippy --all-targets --all-features -- -D warnings
check_status "Rust clippy"

echo -e "${YELLOW}📋 Step 3: Rust Unit Tests${NC}"
cargo test --verbose
check_status "Rust unit tests"

echo -e "${YELLOW}📋 Step 4: Build NAPI Module${NC}"
npm install && npx napi build --release
check_status "NAPI build"

echo -e "${YELLOW}📋 Step 5: Generate Test PDFs${NC}"
mkdir -p ../executed/generated-pdfs
cargo run --bin generate_test_pdfs -- ../executed/generated-pdfs
check_status "Test PDF generation"

cd ..

echo -e "${YELLOW}📋 Step 6: Setup Node Test Environment${NC}"
node scripts/setup-execution-env.mjs
check_status "Test environment setup"

echo -e "${YELLOW}📋 Step 7: Node Dependencies${NC}"
cd node-wrapper && pnpm install --frozen-lockfile
check_status "Node dependencies"

echo -e "${YELLOW}📋 Step 8: Node Lint${NC}"
pnpm lint
check_status "Node linting"

echo -e "${YELLOW}📋 Step 9: Node Unit Tests${NC}"
pnpm test:unit
check_status "Node unit tests"

echo -e "${YELLOW}📋 Step 10: Node Integration Tests${NC}"
pnpm test:integration
check_status "Node integration tests"

echo -e "${YELLOW}📋 Step 11: Node CLI Tests${NC}"
pnpm test:cli
check_status "Node CLI tests"

echo -e "${YELLOW}📋 Step 12: Node Build${NC}"
pnpm build
check_status "Node build"

cd ..

echo -e "${GREEN}🎉 All validation steps passed! Ready for publishing! 🎉${NC}"
echo ""
echo "📦 Next steps:"
echo "  1. Commit all changes"
echo "  2. Create a new release tag"
echo "  3. Push to GitHub to trigger CI/CD"
echo "  4. Publish to npm when CI passes"
