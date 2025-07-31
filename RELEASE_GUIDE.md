# 📦 SoloPDF CLI - NPM Release Guide

This guide provides step-by-step instructions for releasing new versions of SoloPDF CLI to NPM.

## 🚨 Important: Tag vs Release

**Why your tag didn't trigger publishing:**

- ❌ **Git Tags** alone don't trigger the publish workflow
- ✅ **GitHub Releases** trigger the workflow (which can create tags automatically)

## 🛠️ Prerequisites Setup

### 1. NPM Token Configuration

1. Go to [npmjs.com](https://npmjs.com) → Account Settings → Access Tokens
2. Create a new **Automation** token
3. Copy the token
4. In your GitHub repo: Settings → Secrets and Variables → Actions
5. Add new secret: `NPM_TOKEN` with your token value

### 2. Verify Local Setup

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Test the build process
cd rust-core
cargo build --release
cp target/release/librust_core.so index.node

cd ../node-wrapper
pnpm install
pnpm lint
pnpm test
pnpm build
```

## 🚀 Release Process

### Method 1: GitHub Release (Recommended)

#### Step 1: Update Version

Edit `node-wrapper/package.json`:

```json
{
  "name": "solopdf-cli",
  "version": "1.0.0" // Update this version
  // ...
}
```

#### Step 2: Commit Version Changes

```bash
git add node-wrapper/package.json
git commit -m "chore: bump version to 1.0.0"
git push origin main
```

#### Step 3: Create GitHub Release

1. Go to your GitHub repository
2. Click **"Releases"** tab
3. Click **"Create a new release"**
4. Fill out the release form:
   - **Tag version**: `v1.0.0` (must match package.json version with 'v' prefix)
   - **Release title**: `v1.0.0 - Initial Release`
   - **Description**:

     ````markdown
     ## 🎉 Initial Release

     ### Features

     - ⚡ Ultra-fast PDF page counting powered by Rust
     - 🔧 Simple CLI interface (`solopdf pages document.pdf`)
     - 🌐 Cross-platform support (Linux, macOS, Windows)

     ### Installation

     ```bash
     npm install -g solopdf-cli
     ```
     ````

     ### Usage

     ```bash
     solopdf pages document.pdf
     ```

     ```

     ```

   - **Target**: `main` branch
   - ✅ Check **"Set as the latest release"**
5. Click **"Publish release"**

#### Step 4: Monitor the Workflow

1. Go to **Actions** tab in your repository
2. Watch the "Publish to NPM" workflow run
3. Verify it completes successfully

### Method 2: Manual Workflow Trigger

If you need to publish without creating a release:

1. Go to **Actions** tab → **Publish to NPM** workflow
2. Click **"Run workflow"**
3. Choose branch: `main`
4. Leave version empty (uses current package.json)
5. Click **"Run workflow"**

### Method 3: Local Publishing (Emergency Only)

```bash
# From project root
cd rust-core
cargo build --release
cp target/release/librust_core.so index.node

cd ../node-wrapper
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build

# Login to NPM (first time only)
npm login

# Publish
pnpm publish --access public
```

## 🔍 Verification Steps

### 1. Check NPM Package

- Visit: https://www.npmjs.com/package/solopdf-cli
- Verify version number is correct
- Check that files are included properly

### 2. Test Installation

```bash
# Install globally
npm install -g solopdf-cli@latest

# Test CLI
solopdf --help
solopdf pages test.pdf  # (if you have a test PDF)
```

### 3. Verify in Fresh Environment

```bash
# Test in a new directory
mkdir test-solopdf && cd test-solopdf
npm install -g solopdf-cli
solopdf --help
```

## 🐛 Troubleshooting

### Publishing Failed?

#### Check NPM Token

```bash
# Verify token has correct permissions
npm whoami
```

#### Check Package Contents

```bash
cd node-wrapper
npm pack --dry-run
```

#### Check Version Conflicts

```bash
# See if version already exists on NPM
npm view solopdf-cli versions --json
```

### Workflow Not Triggering?

1. **Ensure you created a Release, not just a tag**
2. **Check the release was marked as "published"**
3. **Verify the tag format**: `v1.0.0` (with 'v' prefix)
4. **Check GitHub Actions are enabled** in repository settings

### Build Failures?

#### Rust Build Issues

```bash
cd rust-core
cargo clean
cargo build --release
```

#### Node.js Build Issues

```bash
cd node-wrapper
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## 📋 Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **1.0.0** → **1.0.1** - Patch: Bug fixes, documentation
- **1.0.0** → **1.1.0** - Minor: New features, backwards compatible
- **1.0.0** → **2.0.0** - Major: Breaking changes

## 🎯 Quick Checklist

- [ ] NPM_TOKEN secret configured in GitHub
- [ ] Version updated in `node-wrapper/package.json`
- [ ] All tests passing locally
- [ ] Committed and pushed changes
- [ ] Created GitHub Release (not just tag)
- [ ] Workflow completed successfully
- [ ] Verified package on npmjs.com
- [ ] Tested installation and CLI functionality

## 🚨 Fixing Your Current Situation

Since you already created a tag `v0.0.1-alpha`, here's how to publish it:

### Option A: Create Release from Existing Tag

1. Go to GitHub → Releases → "Create a new release"
2. In "Choose a tag" dropdown, select `v0.0.1-alpha`
3. Fill in release details
4. Click "Publish release"

### Option B: Create New Release

1. Update version in `package.json` to `0.0.2-alpha`
2. Commit and push
3. Create new release with tag `v0.0.2-alpha`

## 📞 Need Help?

If you encounter issues:

1. Check the **Actions** tab for detailed error logs
2. Verify all prerequisites are met
3. Try the manual publishing method as a fallback
4. Ensure the Rust core builds successfully

---

Happy publishing! 🎉 Your blazingly fast Rust-powered PDF CLI will be available to the world! 🌟
