# Installation Guide 📦

This guide covers all installation methods for SoloPDF CLI, from simple npm installation to building from source.

## 🚀 Quick Install (Recommended)

### NPM Global Installation

```bash
npm install -g solopdf-cli
```

### Verify Installation

```bash
solopdf --version
solopdf --help
```

## 📋 Alternative Package Managers

### Yarn

```bash
yarn global add solopdf-cli
```

### pnpm

```bash
pnpm add -g solopdf-cli
```

### npx (No Installation)

Use SoloPDF without installing globally:

```bash
npx solopdf-cli pages document.pdf
npx solopdf-cli info document.pdf
```

## 🛠️ System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Architecture**: x64 (Intel/AMD) or ARM64 (Apple Silicon)
- **RAM**: 512 MB available memory
- **Disk Space**: 50 MB for installation

### Supported Platforms

| Platform    | Architecture          | Status             |
| ----------- | --------------------- | ------------------ |
| **Linux**   | x86_64                | ✅ Fully Supported |
| **macOS**   | x86_64 (Intel)        | ✅ Fully Supported |
| **macOS**   | ARM64 (Apple Silicon) | ✅ Fully Supported |
| **Windows** | x86_64                | ✅ Fully Supported |

## 🔧 Building from Source

### Prerequisites

1. **Install Node.js** (18.0.0 or higher):

   ```bash
   # Download from https://nodejs.org/
   node --version  # Verify installation
   ```

2. **Install pnpm** (8.0.0 or higher):

   ```bash
   npm install -g pnpm
   pnpm --version  # Verify installation
   ```

3. **Install Rust** (latest stable):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   rustc --version  # Verify installation
   ```

### Build Steps

1. **Clone Repository**:

   ```bash
   git clone https://github.com/soloflow-ai/solopdf-cli.git
   cd solopdf-cli
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Build Rust Core**:

   ```bash
   pnpm build:rust
   ```

4. **Build Node.js Wrapper**:

   ```bash
   pnpm build
   ```

5. **Link Globally**:

   ```bash
   cd node-wrapper
   npm link
   ```

6. **Verify Build**:
   ```bash
   solopdf --version
   solopdf pages sample-pdfs/single-page.pdf
   ```

## 🚨 Troubleshooting

### Common Installation Issues

#### "Command not found: solopdf"

**Cause**: Package not in PATH or installation failed

**Solutions**:

```bash
# Option 1: Reinstall globally
npm uninstall -g solopdf-cli
npm install -g solopdf-cli

# Option 2: Check and fix PATH
npm config get prefix
export PATH=$PATH:$(npm config get prefix)/bin

# Option 3: Use full path
$(npm config get prefix)/bin/solopdf --version

# Option 4: Use npx
npx solopdf-cli --version
```

#### "Permission denied" (Linux/macOS)

**Cause**: Insufficient permissions or corrupted installation

**Solutions**:

```bash
# Fix permissions
chmod +x $(which solopdf)

# Or reinstall with sudo
sudo npm install -g solopdf-cli

# Or use a Node version manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
npm install -g solopdf-cli
```

#### "Module not found" Errors

**Cause**: Corrupted npm cache or incomplete installation

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
npm uninstall -g solopdf-cli
npm install -g solopdf-cli

# Or try yarn/pnpm
yarn global remove solopdf-cli
yarn global add solopdf-cli
```

#### Build Errors from Source

**Missing Rust**:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

**Missing Build Tools (Linux)**:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential pkg-config

# CentOS/RHEL/Fedora
sudo yum groupinstall "Development Tools"
# OR
sudo dnf groupinstall "Development Tools"
```

**Missing Build Tools (macOS)**:

```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Missing Build Tools (Windows)**:

```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

# Or install via chocolatey
choco install visualstudio2022buildtools
```

### Platform-Specific Issues

#### Linux Issues

**GLIBC Version Mismatch**:

```bash
# Check your GLIBC version
ldd --version

# If too old, try building from source or upgrading system
```

**Missing Libraries**:

```bash
# Ubuntu/Debian
sudo apt install libc6-dev

# CentOS/RHEL/Fedora
sudo yum install glibc-devel
```

#### macOS Issues

**ARM64 vs x86_64**:

```bash
# Check architecture
uname -m

# For Rosetta compatibility
arch -x86_64 npm install -g solopdf-cli
```

**Gatekeeper Warnings**:

```bash
# Allow the binary to run
sudo spctl --add /usr/local/bin/solopdf
sudo spctl --enable --label "solopdf"
```

#### Windows Issues

**PowerShell Execution Policy**:

```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows Defender**:

- Add solopdf.exe to Windows Defender exclusions if it's being quarantined

## 📦 Uninstallation

### Remove Global Installation

```bash
# npm
npm uninstall -g solopdf-cli

# yarn
yarn global remove solopdf-cli

# pnpm
pnpm remove -g solopdf-cli
```

### Clean Up Build Files

```bash
# If you built from source
cd solopdf-cli
cd rust-core && cargo clean
cd ../node-wrapper && rm -rf node_modules dist
```

## 🔄 Updating

### Update Global Installation

```bash
# Check current version
solopdf --version

# Update to latest
npm update -g solopdf-cli

# Or reinstall
npm uninstall -g solopdf-cli
npm install -g solopdf-cli

# Verify update
solopdf --version
```

### Update Source Build

```bash
cd solopdf-cli

# Pull latest changes
git pull origin main

# Rebuild
pnpm install
pnpm build:all

# Verify update
solopdf --version
```

## 🧪 Testing Installation

### Basic Functionality Test

```bash
# Test help system
solopdf --help
solopdf pages --help

# Test with sample file (if available)
echo "%PDF-1.4" > test.pdf
echo "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj" >> test.pdf
echo "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj" >> test.pdf
echo "3 0 obj<</Type/Page/Parent 2 0 R>>endobj" >> test.pdf
echo "xref" >> test.pdf
echo "0 4" >> test.pdf
echo "0000000000 65535 f " >> test.pdf
echo "0000000010 00000 n " >> test.pdf
echo "0000000053 00000 n " >> test.pdf
echo "0000000125 00000 n " >> test.pdf
echo "trailer<</Size 4/Root 1 0 R>>" >> test.pdf
echo "startxref" >> test.pdf
echo "173" >> test.pdf
echo "%%EOF" >> test.pdf

# Test page counting
solopdf pages test.pdf

# Clean up
rm test.pdf
```

### Performance Test

```bash
# Create a larger test file and measure performance
time solopdf pages large-document.pdf
```

## 💡 Tips & Best Practices

### Performance Tips

- **Use latest Node.js**: Newer versions have better V8 performance
- **Clear npm cache** periodically: `npm cache clean --force`
- **Use local files**: Avoid network file systems for better performance
- **Close other applications**: For optimal performance during large operations

### Security Tips

- **Verify checksums**: Use `solopdf checksum` to verify file integrity
- **Keep updated**: Regularly update to get security fixes
- **Use specific versions**: Pin versions in CI/CD environments

### Development Tips

- **Use version manager**: nvm/fnm for Node.js, rustup for Rust
- **Build locally**: Test builds before deployment
- **Check logs**: Use `--verbose` flags where available

## 📞 Getting Help

If you encounter issues not covered here:

1. **Check existing issues**: [GitHub Issues](https://github.com/soloflow-ai/solopdf-cli/issues)
2. **Search discussions**: [GitHub Discussions](https://github.com/soloflow-ai/solopdf-cli/discussions)
3. **Create new issue**: Include system info, error messages, and steps to reproduce
4. **Join community**: Follow project updates and get help from other users

### System Information Template

When reporting issues, please include:

```bash
# System info
node --version
npm --version
rustc --version  # If building from source
uname -a         # Linux/macOS
systeminfo       # Windows

# SoloPDF info
solopdf --version

# Error output
solopdf pages document.pdf  # Include full error message
```

---

**Need more help?** Check out our [complete documentation](README.md) or [create an issue](https://github.com/soloflow-ai/solopdf-cli/issues).
