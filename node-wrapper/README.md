# SoloPDF CLI 📄✨

[![npm version](https://img.shields.io/npm/v/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![npm downloads](https://img.shields.io/npm/dm/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![GitHub license](https://img.shields.io/github/license/soloflow-ai/solopdf-cli.svg)](https://github.com/soloflow-ai/solopdf-cli/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/node/v/solopdf-cli.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/soloflow-ai/solopdf-cli/ci.yml?branch=main)](https://github.com/soloflow-ai/solopdf-cli/actions)

> A production-ready, blazingly fast PDF manipulation CLI tool powered by Rust and Node.js

## 🚀 Features

- **⚡ Ultra-Fast**: Core operations powered by Rust for maximum performance
- **📊 PDF Analysis**: Get page counts, file information, and checksums instantly
- **✍️ Advanced Watermarking**: Add customizable text watermarks with precise control
- **🔐 Digital Signatures**: Generate keys, sign PDFs cryptographically, and verify signatures
- **🎯 Precise Control**: Target specific pages (odd, even, or custom ranges)
- **🌐 Cross-Platform**: Native binaries for Linux, macOS (Intel & ARM), and Windows
- **🎨 Beautiful CLI**: Colorful, intuitive command-line interface with progress indicators

## 📦 Quick Installation

### NPM (Recommended)

```bash
npm install -g solopdf-cli
```

### Alternative Package Managers

```bash
# Yarn
yarn global add solopdf-cli

# pnpm
pnpm add -g solopdf-cli
```

> 🎉 **Ready to use!** The tool is available as both `solopdf` and `solopdf-cli` commands.

## ⚡ Quick Start

```bash
# Get page count (ultra-fast)
solopdf pages document.pdf

# Get detailed PDF information
solopdf info document.pdf

# Add watermark to all pages
solopdf watermark input.pdf "Confidential" output.pdf

# Watermark specific pages with custom styling
solopdf watermark input.pdf "Draft" output.pdf --pages "1,3,5" --font-size 16 --color red

# Generate cryptographic key pair
solopdf generate-key --output signing-keys.json

# Sign PDF digitally
solopdf sign-digital contract.pdf signed-contract.pdf signing-keys.json
```

## 📖 Complete Usage Guide

### 📊 PDF Analysis Commands

#### 📄 Page Count Analysis
Get the number of pages in a PDF document instantly.

```bash
solopdf pages <file.pdf>
```

**Example Output:**
```bash
$ solopdf pages document.pdf
🔍 Analyzing: /path/to/document.pdf
📊 Counting pages... ✅ Done!
✅ Success! Page count: 25
```

#### ℹ️ Detailed PDF Information
Get comprehensive information about a PDF file.

```bash
solopdf info <file.pdf>
```

**Example Output:**
```bash
$ solopdf info document.pdf
ℹ️  Getting PDF info: /path/to/document.pdf
📋 Analyzing PDF structure... ✅ Done!
✅ Success! PDF Information:
   📄 Pages: 25
   📁 File: /path/to/document.pdf
```

#### 🔐 File Checksum Verification
Generate SHA-256 checksum for file integrity verification.

```bash
solopdf checksum <file.pdf>
```

**Example Output:**
```bash
$ solopdf checksum document.pdf
🔍 Analyzing file: /path/to/document.pdf
🔐 Calculating checksum... ✅ Done!
✅ Success! File Checksum:
   🔐 Checksum: sha256:a1b2c3d4e5f6...
   📁 File: /path/to/document.pdf
💡 Share this checksum with recipients for file verification
```

### ✍️ Advanced PDF Watermarking

#### Basic Watermarking
Add text watermarks to PDF documents with professional results.

```bash
solopdf watermark <input.pdf> "<watermark-text>" <output.pdf>
```

#### Advanced Options Reference

| Option | Description | Default | Example Values |
|--------|-------------|---------|----------------|
| `--font-size <size>` | Font size in points | `12` | `8`, `12`, `16`, `24` |
| `--color <color>` | Text color | `black` | `red`, `blue`, `#FF0000` |
| `--x-position <x>` | X coordinate (points) | Auto | `100`, `200.5` |
| `--y-position <y>` | Y coordinate (points) | Auto | `50`, `150.25` |
| `--pages <selection>` | Page selection | `all` | `all`, `even`, `odd`, `"1,3,5"` |
| `--position <preset>` | Predefined position | `bottom-right` | See positions below |
| `--rotation <degrees>` | Rotation angle | `0` | `-45`, `0`, `45`, `90` |
| `--opacity <level>` | Transparency level | `1.0` | `0.1` to `1.0` |

#### Page Selection Options

| Value | Description | Example Result |
|-------|-------------|----------------|
| `all` | All pages (default) | Pages 1, 2, 3, 4, 5... |
| `even` | Even-numbered pages only | Pages 2, 4, 6, 8... |
| `odd` | Odd-numbered pages only | Pages 1, 3, 5, 7... |
| `"1,3,5"` | Specific pages (comma-separated) | Only pages 1, 3, and 5 |
| `"1-5"` | Page ranges | Pages 1, 2, 3, 4, 5 |

#### Position Presets

```
┌─────────────┬─────────────┬─────────────┐
│  top-left   │ top-center  │  top-right  │
├─────────────┼─────────────┼─────────────┤
│center-left  │   center    │center-right │
├─────────────┼─────────────┼─────────────┤
│bottom-left  │bottom-center│bottom-right │
└─────────────┴─────────────┴─────────────┘
```

#### Real-World Examples

**Confidential Document Watermarking:**
```bash
solopdf watermark sensitive.pdf "CONFIDENTIAL" confidential.pdf \
  --font-size 18 \
  --color red \
  --position center \
  --opacity 0.3 \
  --rotation 45
```

**Draft Watermark on Odd Pages:**
```bash
solopdf watermark proposal.pdf "DRAFT - NOT FINAL" draft-proposal.pdf \
  --pages odd \
  --font-size 14 \
  --color blue \
  --position top-right
```

**Custom Positioned Signature:**
```bash
solopdf watermark contract.pdf "Reviewed by Legal Dept." reviewed-contract.pdf \
  --x-position 50 \
  --y-position 750 \
  --font-size 10 \
  --color gray
```

**Specific Pages with Large Text:**
```bash
solopdf watermark report.pdf "SAMPLE COPY" sample-report.pdf \
  --pages "1,5,10" \
  --font-size 24 \
  --position center \
  --opacity 0.5
```

### 🔐 Digital Signature Operations

#### 🔑 Generate Cryptographic Key Pair

Create a new RSA key pair for digital signing operations.

```bash
solopdf generate-key [--output <filename.json>]
```

**Options:**
- `--output <file>` - Output filename (default: `keypair.json`)

**Example:**
```bash
$ solopdf generate-key --output company-signing-keys.json
🔑 Generating signing key pair...
🔐 Creating cryptographic keys... ✅ Done!
📋 Extracting key information... ✅ Done!
✅ Success! Key pair generated
   🔑 Fingerprint: SHA256:abcd1234...
   📁 Saved to: /path/to/company-signing-keys.json
⚠️  Keep your private key secure!
```

#### ✍️ Digital PDF Signing

Sign PDF documents with cryptographic digital signatures for authenticity and integrity.

```bash
solopdf sign-digital <input.pdf> <output.pdf> <keyfile.json> [OPTIONS]
```

**Options:**
- `--text <text>` - Visible signature text (optional)
- `--save-sig <file>` - Save signature metadata to file (optional)

**Example:**
```bash
$ solopdf sign-digital contract.pdf signed-contract.pdf company-keys.json \
    --text "John Smith, Legal Director" \
    --save-sig signature-info.json

📄 Input PDF: /path/to/contract.pdf
✍️  Output PDF: /path/to/signed-contract.pdf
🔑 Key file: /path/to/company-keys.json
🔐 Digitally signing PDF...
📝 Creating digital signature... ✅ Done!
💾 Signature saved to: /path/to/signature-info.json
✅ Success! PDF digitally signed
   📄 Original: contract.pdf
   📄 Signed: signed-contract.pdf
   🕐 Timestamp: 2025-01-21T14:30:00Z
   🔐 Algorithm: RSA-SHA256
```

#### ✅ Digital Signature Verification

Verify the authenticity and integrity of digitally signed PDF documents.

```bash
solopdf verify-signature <signed.pdf> <signature.json> <keyfile.json>
```

**Example - Valid Signature:**
```bash
$ solopdf verify-signature signed-contract.pdf signature-info.json company-keys.json
📄 PDF file: /path/to/signed-contract.pdf
📋 Signature: /path/to/signature-info.json
🔑 Key file: /path/to/company-keys.json
🔍 Verifying digital signature...
🔐 Validating signature... ✅ Done!
✅ SUCCESS! Digital signature is VALID
   🎉 Document is authentic and unmodified
   🕐 Verified at: 2025-01-21T14:35:00Z
   📅 Signed at: 2025-01-21T14:30:00Z
   🔐 Algorithm: RSA-SHA256
```

**Example - Invalid Signature:**
```bash
$ solopdf verify-signature tampered.pdf signature-info.json company-keys.json
❌ FAILED! Digital signature is INVALID
   📝 Reason: Document has been modified after signing
   🕐 Verified at: 2025-01-21T14:40:00Z
```

## 📋 Complete Command Reference

| Command | Syntax | Description |
|---------|--------|-------------|
| **Analysis** | | |
| `pages` | `solopdf pages <file.pdf>` | Get page count instantly |
| `info` | `solopdf info <file.pdf>` | Get detailed PDF information |
| `checksum` | `solopdf checksum <file.pdf>` | Generate SHA-256 checksum |
| **Watermarking** | | |
| `watermark` | `solopdf watermark <input.pdf> "<text>" <output.pdf> [options]` | Add advanced watermarks |
| **Digital Signatures** | | |
| `generate-key` | `solopdf generate-key [--output file.json]` | Generate RSA key pair |
| `sign-digital` | `solopdf sign-digital <input.pdf> <output.pdf> <keyfile.json> [options]` | Sign PDF digitally |
| `verify-signature` | `solopdf verify-signature <signed.pdf> <sig.json> <key.json>` | Verify digital signature |
| **Help & Info** | | |
| `--help` | `solopdf --help` or `solopdf <command> --help` | Show detailed help |
| `--version` | `solopdf --version` | Show version information |

## 🛠️ System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **RAM**: 512 MB available memory
- **Disk Space**: 50 MB for installation
- **Operating System**: Linux, macOS, or Windows

### Supported Architectures
- **Linux**: x86_64 (Intel/AMD 64-bit)
- **macOS**: x86_64 (Intel) and ARM64 (Apple Silicon)
- **Windows**: x86_64 (Intel/AMD 64-bit)

> 🎉 **Zero Configuration**: The Rust core is pre-compiled and included - no additional setup required!

## 📊 Performance Benchmarks

SoloPDF CLI is optimized for speed:

| Operation | Typical Performance | Large Files (100+ pages) |
|-----------|-------------------|---------------------------|
| **Page Count** | < 1ms | < 10ms |
| **PDF Info** | < 2ms | < 15ms |
| **Checksum** | 5-20ms | 50-200ms |
| **Watermarking** | 10-100ms | 100ms-2s |
| **Digital Signing** | 50-200ms | 200ms-1s |
| **Signature Verification** | 30-150ms | 150ms-500ms |

*Performance measured on modern systems. Results may vary based on hardware and document complexity.*

## 🏗️ Development & Building

### Development Setup

1. **Prerequisites:**
   ```bash
   # Install Node.js 18+ and pnpm 8+
   node --version  # Should be 18.0.0+
   pnpm --version  # Should be 8.0.0+
   
   # Install Rust (latest stable)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Clone and Build:**
   ```bash
   git clone https://github.com/soloflow-ai/solopdf-cli.git
   cd solopdf-cli
   
   # Install all dependencies
   pnpm install
   
   # Build Rust core with native optimizations
   pnpm build:rust
   
   # Build Node.js wrapper
   pnpm build
   
   # Link for global testing
   cd node-wrapper && npm link
   ```

3. **Verify Installation:**
   ```bash
   solopdf --version
   solopdf pages sample-pdfs/single-page.pdf
   ```

### Development Commands

| Command | Purpose | Usage |
|---------|---------|--------|
| `pnpm test` | Run all tests | Full test suite |
| `pnpm lint` | Check code style | TypeScript + Rust |
| `pnpm build:rust` | Build Rust core | Native compilation |
| `pnpm build:all` | Build everything | Complete build |
| `pnpm validate` | Quick validation | Pre-commit checks |
| `cargo fmt` | Format Rust code | Code formatting |
| `cargo test` | Run Rust tests | Core functionality |

### Cross-Platform Building

Build native binaries for all supported platforms:

```bash
# Build for specific platforms
pnpm run build:linux      # Linux x86_64
pnpm run build:windows    # Windows x86_64
pnpm run build:macos      # macOS Intel
pnpm run build:macos-arm  # macOS Apple Silicon

# Build all platforms (requires cross-compilation setup)
pnpm run build:all-platforms
```

## 🔒 Security Features

### Digital Signature Security
- **RSA-2048 keys** for strong cryptographic security
- **SHA-256 hashing** for data integrity verification  
- **Timestamp validation** prevents replay attacks
- **Key fingerprinting** for identity verification

### File Security
- **No data transmission** - all operations are local
- **Temporary file cleanup** - no data left behind
- **Memory-safe operations** - Rust prevents buffer overflows
- **Checksum verification** - detect file tampering

### Privacy Protection
- **Zero telemetry** - no usage data collected
- **No network requests** - completely offline operation
- **Local processing only** - your files never leave your system

## 🚨 Troubleshooting

### Common Issues

**❓ "Command not found: solopdf"**
```bash
# Solution 1: Reinstall globally
npm install -g solopdf-cli

# Solution 2: Check npm global path
npm config get prefix
export PATH=$PATH:$(npm config get prefix)/bin

# Solution 3: Use npx (temporary usage)
npx solopdf-cli pages document.pdf
```

**❓ "Permission denied" on Linux/macOS**
```bash
# Fix: Make binary executable
chmod +x $(which solopdf)

# Or reinstall with proper permissions
sudo npm install -g solopdf-cli
```

**❓ "Module not found" errors**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g solopdf-cli
```

**❓ "Invalid PDF" or parsing errors**
```bash
# Verify file integrity
file document.pdf
solopdf checksum document.pdf

# Try with a known good PDF
solopdf pages sample-pdfs/single-page.pdf
```

### Getting Help

1. **Check command help**: `solopdf --help` or `solopdf <command> --help`
2. **Verify installation**: `solopdf --version`  
3. **Test with sample**: Use files from `sample-pdfs/` directory
4. **Report issues**: [GitHub Issues](https://github.com/soloflow-ai/solopdf-cli/issues)

## 📚 API Reference

### Node.js Integration

You can also use SoloPDF CLI functions directly in your Node.js applications:

```javascript
import { 
  getPageCount,
  signPdfWithOptions,
  getPdfInfoBeforeSigning 
} from 'solopdf-cli';

// Get page count
const pages = getPageCount('/path/to/document.pdf');
console.log(`Document has ${pages} pages`);

// Add watermark with options
const options = {
  fontSize: 14,
  color: 'red',
  pages: [1, 3, 5],
  position: 'center',
  opacity: 0.5
};

signPdfWithOptions('/path/to/input.pdf', 'SAMPLE', options);
```

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how to get involved:

### Quick Contribution Guide

1. **🍴 Fork** the repository on GitHub
2. **📝 Create** a feature branch: `git checkout -b feature/amazing-feature`  
3. **🛠️ Make** your changes and add tests
4. **✅ Test** your changes: `pnpm test`
5. **📤 Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **🚀 Push** to your branch: `git push origin feature/amazing-feature`
7. **📥 Open** a Pull Request with detailed description

### Areas for Contribution

- **🐛 Bug Fixes**: Fix issues and improve reliability
- **⭐ New Features**: Add PDF manipulation capabilities  
- **📚 Documentation**: Improve guides and examples
- **🧪 Testing**: Add test cases and improve coverage
- **🎨 UI/UX**: Enhance CLI interface and user experience
- **🔧 Performance**: Optimize speed and memory usage

### Development Guidelines

- **Code Style**: Follow existing patterns and run `pnpm lint`
- **Testing**: Add tests for new features (`pnpm test`)
- **Documentation**: Update README and inline docs
- **Commits**: Use clear, descriptive commit messages
- **Pull Requests**: Include detailed description and link issues

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify and adapt the code  
- ✅ **Distribution** - Share and redistribute
- ✅ **Private use** - Use for personal projects
- ✅ **No warranty** - Software provided "as is"

## 🙋‍♂️ Support & Community

### Get Help

- **📖 Documentation**: This README and `solopdf --help`
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/soloflow-ai/solopdf-cli/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/soloflow-ai/solopdf-cli/discussions)  
- **❓ General Questions**: [GitHub Discussions](https://github.com/soloflow-ai/solopdf-cli/discussions)

### Stay Updated

- **⭐ Star the repository** for updates
- **👀 Watch releases** for new versions
- **📢 Follow us** on social media for announcements

---

<div align="center">

**Made with ❤️ by [Soloflow.AI](https://github.com/soloflow-ai)**

[⭐ Star this project](https://github.com/soloflow-ai/solopdf-cli) • [🐛 Report a bug](https://github.com/soloflow-ai/solopdf-cli/issues) • [💡 Request a feature](https://github.com/soloflow-ai/solopdf-cli/discussions) • [🤝 Contribute](https://github.com/soloflow-ai/solopdf-cli/blob/main/CONTRIBUTING.md)

</div>
