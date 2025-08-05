#!/bin/bash

# Comprehensive publish preparation script
echo "🚀 Preparing SoloPDF CLI for Publishing"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 passed${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

echo -e "${BLUE}🔧 Phase 1: Rust Core Validation and Build${NC}"

echo -e "${YELLOW}📋 Step 1.1: Rust Formatting Check${NC}"
cd rust-core && cargo fmt --check
check_status "Rust formatting"

echo -e "${YELLOW}📋 Step 1.2: Rust Clippy${NC}"
cargo clippy --all-targets --all-features -- -D warnings
check_status "Rust clippy"

echo -e "${YELLOW}📋 Step 1.3: Rust Unit Tests${NC}"
cargo test --verbose
check_status "Rust unit tests"

echo -e "${YELLOW}📋 Step 1.4: Install NAPI Dependencies${NC}"
npm install
check_status "NAPI dependencies"

echo -e "${YELLOW}📋 Step 1.5: Build NAPI Module (Release)${NC}"
npx napi build --release
check_status "NAPI build"

echo -e "${YELLOW}📋 Step 1.6: Verify NAPI Module Files${NC}"
if [ -f "index.node" ] && [ -f "index.js" ] && [ -f "index.d.ts" ]; then
    echo -e "${GREEN}✅ All NAPI files present${NC}"
else
    echo -e "${RED}❌ Missing NAPI files${NC}"
    ls -la index.*
    exit 1
fi

echo -e "${YELLOW}📋 Step 1.7: Generate Test PDFs${NC}"
mkdir -p ../executed/generated-pdfs
cargo run --bin generate_test_pdfs -- ../executed/generated-pdfs
check_status "Test PDF generation"

cd ..

echo -e "${BLUE}🔧 Phase 2: Node.js Environment Setup${NC}"

echo -e "${YELLOW}📋 Step 2.1: Setup Test Environment${NC}"
node scripts/setup-execution-env.mjs
check_status "Test environment setup"

echo -e "${YELLOW}📋 Step 2.2: Install Node Dependencies${NC}"
cd node-wrapper && pnpm install --frozen-lockfile
check_status "Node dependencies"

echo -e "${BLUE}🔧 Phase 3: Node.js Validation${NC}"

echo -e "${YELLOW}📋 Step 3.1: Node Lint${NC}"
pnpm lint
check_status "Node linting"

echo -e "${YELLOW}📋 Step 3.2: Node Unit Tests${NC}"
pnpm test:unit
check_status "Node unit tests"

echo -e "${YELLOW}📋 Step 3.3: Node Integration Tests${NC}"
pnpm test:integration
check_status "Node integration tests"

echo -e "${YELLOW}📋 Step 3.4: Node CLI Tests${NC}"
pnpm test:cli
check_status "Node CLI tests"

echo -e "${YELLOW}📋 Step 3.5: Node Tests with Coverage${NC}"
pnpm test:coverage
check_status "Node tests with coverage"

echo -e "${YELLOW}📋 Step 3.6: Node Build${NC}"
pnpm build
check_status "Node build"

cd ..

echo -e "${BLUE}🔧 Phase 4: Final Validation${NC}"

echo -e "${YELLOW}📋 Step 4.1: Verify Distributed Files${NC}"
if [ -f "node-wrapper/dist/index.js" ] && [ -f "node-wrapper/dist/rust-core/index.node" ]; then
    echo -e "${GREEN}✅ Distribution files present${NC}"
else
    echo -e "${RED}❌ Missing distribution files${NC}"
    echo "Contents of node-wrapper/dist/:"
    ls -la node-wrapper/dist/ || echo "dist directory not found"
    echo "Contents of node-wrapper/dist/rust-core/:"
    ls -la node-wrapper/dist/rust-core/ || echo "rust-core directory not found"
    exit 1
fi

echo -e "${YELLOW}📋 Step 4.2: Test CLI Executable${NC}"
cd node-wrapper
chmod +x dist/index.js
./dist/index.js --help
check_status "CLI executable test"

cd ..

echo -e "${GREEN}🎉 All validation steps passed! Ready for publishing! 🎉${NC}"
echo ""
echo "📦 Next steps:"
echo "  1. Commit all changes: ${YELLOW}git add . && git commit -m 'Ready for release'${NC}"
echo "  2. Create a new release tag: ${YELLOW}git tag v0.0.6-alpha${NC}"
echo "  3. Push to GitHub: ${YELLOW}git push && git push --tags${NC}"
echo "  4. Wait for CI to pass"
echo "  5. Publish to npm: ${YELLOW}cd node-wrapper && npm publish${NC}"
echo ""
echo "📋 Or run the automated publish:"
echo "  ${YELLOW}./scripts/publish.sh${NC}"
