# SoloPDF CLI 📄✨

[![npm version](https://img.shields.io/npm/v/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![npm downloads](https://img.shields.io/npm/dm/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![GitHub license](https://img.shields.io/github/license/soloflow-ai/solopdf-cli.svg)](https://github.com/soloflow-ai/solopdf-cli/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/soloflow-ai/solopdf-cli.svg)](https://github.com/soloflow-ai/solopdf-cli/stargazers)
[![Build Status](https://img.shields.io/github/actions/workflow/status/soloflow-ai/solopdf-cli/ci.yml?branch=main)](https://github.com/soloflow-ai/solopdf-cli/actions)
[![Node.js Version](https://img.shields.io/node/v/solopdf-cli.svg)](https://nodejs.org/)

> A blazingly fast, cross-platform PDF manipulation CLI tool powered by Rust and Node.js

## 🚀 Features

- **⚡ Ultra-Fast**: Core operations powered by Rust for maximum performance
- **📊 PDF Analysis**: Get page counts, file information, and checksums
- **✍️ PDF Watermarking**: Add customizable text watermarks with advanced options
- **🔐 Digital Signatures**: Generate keys, sign PDFs, and verify signatures
- **🎯 Precise Control**: Target specific pages (odd, even, or custom ranges)
- **🌐 Cross-Platform**: Works seamlessly on Linux, macOS, and Windows
- **📦 Easy Installation**: Available via npm with zero configuration
- **🎨 Beautiful CLI**: Colorful, intuitive command-line interface

## 📦 Installation

### NPM (Recommended)

```bash
npm install -g solopdf-cli
```

### Yarn

```bash
yarn global add solopdf-cli
```

### pnpm

```bash
pnpm add -g solopdf-cli
```

After installation, the tool is available as both `solopdf` and `solopdf-cli` commands.

## 🚀 Quick Start

```bash
# Get page count of a PDF
solopdf pages document.pdf

# Get detailed PDF information
solopdf info document.pdf

# Add a watermark to all pages
solopdf watermark input.pdf "Confidential" output.pdf

# Add a watermark to specific pages only
solopdf watermark input.pdf "Draft" output.pdf --pages "1,3,5"

# Generate a digital signing key pair
solopdf generate-key --output my-key.json

# Sign a PDF digitally
solopdf sign-digital input.pdf signed.pdf my-key.json

# Verify a digital signature
solopdf verify-signature signed.pdf signature.json my-key.json
```

## 📖 Complete Usage Guide

### 📊 PDF Analysis Commands

#### Get Page Count

```bash
solopdf pages <file.pdf>
```

**Example:**

```bash
solopdf pages document.pdf
# Output: ✅ Success! Page count: 25
```

#### Get PDF Information

```bash
solopdf info <file.pdf>
```

**Example:**

```bash
solopdf info document.pdf
# Output:
# ✅ Success! PDF Information:
#    📄 Pages: 25
#    📁 File: /path/to/document.pdf
```

#### Get File Checksum

```bash
solopdf checksum <file.pdf>
```

**Example:**

```bash
solopdf checksum document.pdf
# Output:
# ✅ Success! File Checksum:
#    🔐 Checksum: sha256:a1b2c3d4...
#    📁 File: /path/to/document.pdf
```

### ✍️ PDF Watermarking

#### Basic Watermarking

```bash
solopdf watermark <input.pdf> "<text>" <output.pdf>
```

#### Advanced Watermarking Options

```bash
solopdf watermark input.pdf "Watermark Text" output.pdf [OPTIONS]
```

**Available Options:**

| Option                 | Description             | Default        | Example               |
| ---------------------- | ----------------------- | -------------- | --------------------- |
| `--font-size <size>`   | Font size for watermark | `12`           | `--font-size 16`      |
| `--color <color>`      | Text color              | `black`        | `--color red`         |
| `--x-position <x>`     | X coordinate            | Auto           | `--x-position 100`    |
| `--y-position <y>`     | Y coordinate            | Auto           | `--y-position 50`     |
| `--pages <pages>`      | Target pages            | `all`          | `--pages "1,3,5"`     |
| `--position <pos>`     | Predefined position     | `bottom-right` | `--position top-left` |
| `--rotation <degrees>` | Rotation angle          | `0`            | `--rotation 45`       |
| `--opacity <opacity>`  | Transparency (0.0-1.0)  | `1.0`          | `--opacity 0.5`       |

**Page Selection Options:**

- `all` - Watermark all pages (default)
- `even` - Watermark only even pages
- `odd` - Watermark only odd pages
- `"1,3,5"` - Watermark specific pages (comma-separated list)

**Position Options:**

- `top-left`, `top-center`, `top-right`
- `center-left`, `center`, `center-right`
- `bottom-left`, `bottom-center`, `bottom-right`

**Examples:**

```bash
# Watermark all pages with default settings
solopdf watermark document.pdf "Confidential" watermarked.pdf

# Watermark only odd pages with large red text
solopdf watermark document.pdf "Draft" draft.pdf --pages "odd" --font-size 18 --color red

# Watermark specific pages with custom positioning
solopdf watermark document.pdf "Review Copy" review.pdf --pages "1,5,10" --position "top-center"

# Semi-transparent diagonal watermark
solopdf watermark document.pdf "Sample" sample.pdf --rotation 45 --opacity 0.3
```

### 🔐 Digital Signature Commands

#### Generate Signing Key Pair

```bash
solopdf generate-key [OPTIONS]
```

**Options:**

- `--output <file>` - Output file for key pair (default: `keypair.json`)

**Example:**

```bash
solopdf generate-key --output company-keys.json
# Output:
# ✅ Success! Key pair generated
#    🔑 Fingerprint: abc123def456...
#    📁 Saved to: /path/to/company-keys.json
```

#### Sign PDF Digitally

```bash
solopdf sign-digital <input.pdf> <output.pdf> <keyfile.json> [OPTIONS]
```

**Options:**

- `--text <text>` - Visible signature text (optional)
- `--save-sig <file>` - Save signature info to file (optional)

**Example:**

```bash
solopdf sign-digital contract.pdf signed-contract.pdf my-keys.json --text "John Doe - 2025"
# Output:
# ✅ Success! PDF digitally signed
#    📄 Original: contract.pdf
#    📄 Signed: signed-contract.pdf
#    🕐 Timestamp: 2025-01-21T10:30:00Z
#    🔐 Algorithm: RSA-SHA256
```

#### Verify Digital Signature

```bash
solopdf verify-signature <signed.pdf> <signature.json> <keyfile.json>
```

**Example:**

```bash
solopdf verify-signature signed-contract.pdf signature.json my-keys.json
# Output:
# ✅ SUCCESS! Digital signature is VALID
#    🎉 Document is authentic and unmodified
#    🕐 Verified at: 2025-01-21T10:35:00Z
```

## 📋 Command Reference

| Command            | Syntax                                                          | Description         |
| ------------------ | --------------------------------------------------------------- | ------------------- |
| `pages`            | `solopdf pages <file.pdf>`                                      | Get page count      |
| `info`             | `solopdf info <file.pdf>`                                       | Get PDF information |
| `checksum`         | `solopdf checksum <file.pdf>`                                   | Get file checksum   |
| `watermark`        | `solopdf watermark <input.pdf> "<text>" <output.pdf> [options]` | Add watermark       |
| `generate-key`     | `solopdf generate-key [--output file.json]`                     | Generate key pair   |
| `sign-digital`     | `solopdf sign-digital <input.pdf> <output.pdf> <keyfile.json>`  | Sign PDF            |
| `verify-signature` | `solopdf verify-signature <signed.pdf> <sig.json> <key.json>`   | Verify signature    |
| `--help`           | `solopdf --help` or `solopdf <command> --help`                  | Show help           |
| `--version`        | `solopdf --version`                                             | Show version        |

## ⚙️ Requirements

- **Node.js**: 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Architecture**: x64 (Intel/AMD64) or ARM64 (Apple Silicon)

The Rust core is pre-compiled and included in the package - no additional setup required!

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18.x or later)
- pnpm (v8.x or later)
- Rust (latest stable)

### Building from Source

1. **Clone the repository:**

```bash
git clone https://github.com/soloflow-ai/solopdf-cli.git
cd solopdf-cli
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Build Rust core:**

```bash
pnpm build:rust
```

4. **Build Node.js wrapper:**

```bash
pnpm build
```

5. **Link for global usage:**

```bash
cd node-wrapper
npm link
```

6. **Test installation:**

```bash
solopdf --help
```

### Development Commands

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format Rust code
cd rust-core && cargo fmt

# Build for all platforms
pnpm run build:all

# Quick validation
pnpm run validate
```

## 🏗️ Architecture

SoloPDF CLI is built with a hybrid architecture for optimal performance:

- **Rust Core** (`rust-core/`): High-performance PDF operations using native libraries
- **Node.js Wrapper** (`node-wrapper/`): CLI interface and Node.js bindings via NAPI-RS
- **Cross-Platform**: Native binaries for Linux, macOS (Intel & ARM), and Windows

```
┌─────────────────────┐
│   CLI Interface     │ ← Beautiful, colorful CLI with Chalk & Commander
│   (Node.js/TypeScript)
├─────────────────────┤
│   NAPI-RS Bindings  │ ← Zero-copy bindings between Node.js and Rust
├─────────────────────┤
│   Rust Core         │ ← Ultra-fast PDF processing with native performance
│   (PDF Libraries)   │
└─────────────────────┘
```

## 📊 Performance

SoloPDF CLI is designed for speed:

- **Page counting**: ~1ms for typical documents
- **Watermarking**: ~10-50ms depending on document size
- **Digital signing**: ~50-200ms depending on key size
- **Memory efficient**: Processes large PDFs with minimal memory usage

## 🔒 Security

- **Digital signatures** use industry-standard RSA with SHA-256
- **Key generation** uses cryptographically secure random number generation
- **No data collection** - all operations are performed locally
- **File integrity** verification with SHA-256 checksums

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/awesome-feature`
3. **Make your changes** and add tests
4. **Run tests**: `pnpm test`
5. **Commit your changes**: `git commit -m 'Add awesome feature'`
6. **Push to branch**: `git push origin feature/awesome-feature`
7. **Open a Pull Request**

Please read our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **📖 Documentation**: Check this README and command help (`solopdf --help`)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/soloflow-ai/solopdf-cli/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/soloflow-ai/solopdf-cli/discussions)
- **🆘 General Help**: [GitHub Discussions](https://github.com/soloflow-ai/solopdf-cli/discussions)

## 🎯 Roadmap

### Coming Soon

- **PDF Merging**: Combine multiple PDFs into one
- **PDF Splitting**: Extract pages or split by page ranges
- **HTML to PDF**: Convert web pages and HTML files to PDF
- **Form Filling**: Programmatically fill PDF forms
- **Text Extraction**: Extract text content from PDFs
- **PDF Optimization**: Compress and optimize file sizes

### Future Features

- **OCR Support**: Extract text from scanned PDFs
- **Batch Operations**: Process multiple files at once
- **Template System**: Create PDFs from templates
- **Advanced Layouts**: Complex page arrangements and transformations

---

<div align="center">

**Made with ❤️ by [Soloflow.AI](https://github.com/soloflow-ai)**

[⭐ Star this project](https://github.com/soloflow-ai/solopdf-cli) • [🐛 Report a bug](https://github.com/soloflow-ai/solopdf-cli/issues) • [💡 Request a feature](https://github.com/soloflow-ai/solopdf-cli/discussions)

</div>
