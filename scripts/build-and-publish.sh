#!/bin/bash

# SoloPDF CLI - Complete Build and Publish Script
# Usage: ./scripts/build-and-publish.sh [version] [--dry-run]
# Example: ./scripts/build-and-publish.sh 0.0.8
# Example: ./scripts/build-and-publish.sh 0.0.8 --dry-run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR="$ROOT_DIR/temp-publish"
DRY_RUN=false

# Parse arguments
VERSION="$1"
if [[ "$2" == "--dry-run" || "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    if [[ "$1" == "--dry-run" ]]; then
        VERSION=""
    fi
fi

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}🔄 $1${NC}"
}

# Validate prerequisites
validate_prerequisites() {
    log_step "Validating prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "$ROOT_DIR/package.json" ]]; then
        log_error "Must be run from the solopdf-cli root directory"
        exit 1
    fi
    
    # Check required tools
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required"; exit 1; }
    command -v pnpm >/dev/null 2>&1 || { log_error "pnpm is required"; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "git is required"; exit 1; }
    
    # Check NPM authentication
    if ! npm whoami >/dev/null 2>&1; then
        log_error "You must be logged in to NPM (run 'npm login')"
        exit 1
    fi
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory has uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Prerequisites validated"
}

# Get or validate version
get_version() {
    if [[ -z "$VERSION" ]]; then
        # Get current version and suggest next patch version
        CURRENT_VERSION=$(node -p "require('./package.json').version")
        MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
        MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
        PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)
        NEXT_PATCH=$((PATCH + 1))
        SUGGESTED_VERSION="$MAJOR.$MINOR.$NEXT_PATCH"
        
        echo -e "\nCurrent version: ${YELLOW}$CURRENT_VERSION${NC}"
        read -p "Enter new version [$SUGGESTED_VERSION]: " INPUT_VERSION
        VERSION=${INPUT_VERSION:-$SUGGESTED_VERSION}
    fi
    
    # Validate version format
    if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
        exit 1
    fi
    
    log_info "Target version: $VERSION"
}

# Update package versions
update_versions() {
    log_step "Updating package versions"
    
    # Update root package.json
    node -e "
        const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
        pkg.version = '$VERSION';
        require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    # Update node-wrapper package.json
    node -e "
        const pkg = JSON.parse(require('fs').readFileSync('node-wrapper/package.json', 'utf8'));
        pkg.version = '$VERSION';
        require('fs').writeFileSync('node-wrapper/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    # Update publish workflow
    sed -i.bak "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$VERSION\"/g" .github/workflows/publish.yml
    rm -f .github/workflows/publish.yml.bak
    
    log_success "Updated versions to $VERSION"
}

# Run validation tests
run_validation() {
    log_step "Running validation tests"
    
    cd "$ROOT_DIR"
    
    # Run quick check
    if [[ -x "./scripts/quick-check.sh" ]]; then
        ./scripts/quick-check.sh
    else
        log_warning "Quick check script not found, running manual validation"
        
        # Rust validation
        cd rust-core
        if command -v cargo >/dev/null 2>&1; then
            cargo fmt --check
            cargo clippy --all-targets --all-features -- -D warnings
            cargo test --verbose
        else
            log_warning "Cargo not available, skipping Rust validation"
        fi
        
        # Node validation
        cd ../node-wrapper
        pnpm install
        pnpm lint
        pnpm test
        pnpm build
        
        cd "$ROOT_DIR"
    fi
    
    log_success "Validation completed"
}

# Build binaries for current platform
build_local_binaries() {
    log_step "Building local binaries"
    
    cd "$ROOT_DIR/rust-core"
    
    # Install dependencies
    npm install
    
    # Build for current platform
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        npx napi build --release --platform --target x86_64-unknown-linux-gnu
        log_success "Built Linux x64 binary"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        npx napi build --release --platform --target x86_64-apple-darwin
        log_success "Built macOS x64 binary"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        npx napi build --release --platform --target x86_64-pc-windows-msvc
        log_success "Built Windows x64 binary"
    else
        log_warning "Unknown platform, building default binary"
        npx napi build --release --platform
    fi
    
    cd "$ROOT_DIR"
}

# Create platform packages
create_platform_packages() {
    log_step "Creating platform packages"
    
    # Clean up previous builds
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    
    # Determine current platform
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM_NAME="linux-x64-gnu"
        PLATFORM_OS="linux"
        PLATFORM_CPU="x64"
        BINARY_PATTERN="*.linux-x64-gnu.node"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == "arm64" ]]; then
            PLATFORM_NAME="darwin-arm64"
            PLATFORM_CPU="arm64"
        else
            PLATFORM_NAME="darwin-x64"
            PLATFORM_CPU="x64"
        fi
        PLATFORM_OS="darwin"
        BINARY_PATTERN="*.darwin*.node"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        PLATFORM_NAME="win32-x64-msvc"
        PLATFORM_OS="win32"
        PLATFORM_CPU="x64"
        BINARY_PATTERN="*.win32-x64-msvc.node"
    else
        log_error "Unsupported platform for local publishing"
        return 1
    fi
    
    # Create platform package directory
    PLATFORM_DIR="$TEMP_DIR/solopdf-cli-$PLATFORM_NAME"
    mkdir -p "$PLATFORM_DIR"
    
    # Create platform package.json
    cat > "$PLATFORM_DIR/package.json" << EOF
{
  "name": "solopdf-cli-$PLATFORM_NAME",
  "version": "$VERSION",
  "description": "SoloPDF CLI native binary for $PLATFORM_NAME",
  "main": "index.node",
  "files": ["index.node"],
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/soloflow-ai/solopdf-cli.git"
  },
  "cpu": ["$PLATFORM_CPU"],
  "os": ["$PLATFORM_OS"]
}
EOF
    
    # Copy the binary
    BINARY_FILE=$(find rust-core -name "$BINARY_PATTERN" -o -name "index.node" | head -1)
    if [[ -f "$BINARY_FILE" ]]; then
        cp "$BINARY_FILE" "$PLATFORM_DIR/index.node"
        log_success "Created platform package for $PLATFORM_NAME"
    else
        log_error "Binary file not found for $PLATFORM_NAME"
        return 1
    fi
}

# Build node wrapper
build_node_wrapper() {
    log_step "Building Node.js wrapper"
    
    cd "$ROOT_DIR/node-wrapper"
    pnpm install
    pnpm build
    
    log_success "Node.js wrapper built"
    cd "$ROOT_DIR"
}

# Publish packages
publish_packages() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_step "DRY RUN: Would publish packages"
        
        # Test platform package
        if [[ -d "$TEMP_DIR" ]]; then
            for platform_dir in "$TEMP_DIR"/solopdf-cli-*; do
                if [[ -d "$platform_dir" ]]; then
                    log_info "Would publish: $(basename "$platform_dir")"
                    cd "$platform_dir"
                    npm publish --dry-run --access public
                fi
            done
        fi
        
        # Test main package
        cd "$ROOT_DIR/node-wrapper"
        log_info "Would publish: solopdf-cli@$VERSION"
        npm publish --dry-run --access public
        
        cd "$ROOT_DIR"
        return 0
    fi
    
    log_step "Publishing packages"
    
    # Publish platform packages first
    if [[ -d "$TEMP_DIR" ]]; then
        for platform_dir in "$TEMP_DIR"/solopdf-cli-*; do
            if [[ -d "$platform_dir" ]]; then
                log_info "Publishing $(basename "$platform_dir")"
                cd "$platform_dir"
                
                # Check if already published
                PACKAGE_NAME=$(basename "$platform_dir")
                if npm view "$PACKAGE_NAME@$VERSION" >/dev/null 2>&1; then
                    log_warning "$PACKAGE_NAME@$VERSION already published, skipping"
                else
                    npm publish --access public
                    log_success "Published $PACKAGE_NAME@$VERSION"
                fi
            fi
        done
    fi
    
    # Publish main package
    cd "$ROOT_DIR/node-wrapper"
    if npm view "solopdf-cli@$VERSION" >/dev/null 2>&1; then
        log_warning "solopdf-cli@$VERSION already published, skipping"
    else
        npm publish --access public
        log_success "Published solopdf-cli@$VERSION"
    fi
    
    cd "$ROOT_DIR"
}

# Create git tag and push
create_git_tag() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_step "DRY RUN: Would create git tag v$VERSION"
        return 0
    fi
    
    log_step "Creating git tag and pushing changes"
    
    # Add and commit changes
    git add .
    git commit -m "chore: release v$VERSION

- Update package versions to $VERSION
- Update workflow configurations
- Ready for release" || log_warning "No changes to commit"
    
    # Create tag
    if git tag -l | grep -q "^v$VERSION$"; then
        log_warning "Tag v$VERSION already exists"
    else
        git tag "v$VERSION"
        log_success "Created tag v$VERSION"
    fi
    
    # Push changes and tags
    git push origin main
    git push --tags
    
    log_success "Changes and tags pushed to GitHub"
}

# Trigger GitHub Actions for cross-platform builds
trigger_github_actions() {
    log_step "GitHub Actions will build Windows binaries automatically"
    log_info "Monitor the build at: https://github.com/soloflow-ai/solopdf-cli/actions"
    log_info "Windows package will be published when the workflow completes"
}

# Cleanup
cleanup() {
    log_step "Cleaning up"
    rm -rf "$TEMP_DIR"
    log_success "Cleanup completed"
}

# Verify installation
verify_installation() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_step "DRY RUN: Would verify installation"
        return 0
    fi
    
    log_step "Verifying installation"
    
    # Wait a moment for NPM to propagate
    sleep 5
    
    # Test installation in a temporary directory
    VERIFY_DIR="/tmp/solopdf-verify-$$"
    mkdir -p "$VERIFY_DIR"
    cd "$VERIFY_DIR"
    
    if npm install "solopdf-cli@$VERSION" >/dev/null 2>&1; then
        if npx solopdf --version >/dev/null 2>&1; then
            log_success "Installation verified successfully"
        else
            log_warning "Package installed but CLI not working correctly"
        fi
    else
        log_warning "Could not verify installation (NPM propagation delay)"
    fi
    
    # Cleanup
    rm -rf "$VERIFY_DIR"
    cd "$ROOT_DIR"
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               SoloPDF CLI Build & Publish Script            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    validate_prerequisites
    get_version
    update_versions
    run_validation
    build_local_binaries
    create_platform_packages
    build_node_wrapper
    publish_packages
    create_git_tag
    trigger_github_actions
    verify_installation
    cleanup
    
    echo -e "\n${GREEN}🎉 Build and publish completed successfully!${NC}"
    echo -e "${BLUE}📦 Published: solopdf-cli@$VERSION${NC}"
    echo -e "${BLUE}🔗 NPM: https://www.npmjs.com/package/solopdf-cli${NC}"
    echo -e "${BLUE}📱 Install: npm install -g solopdf-cli@$VERSION${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "\n${YELLOW}Note: This was a dry run. No packages were actually published.${NC}"
    fi
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
