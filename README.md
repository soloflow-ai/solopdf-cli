# SoloPDF CLI 📄✨

[![npm version](https://img.shields.io/npm/v/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![downloads](https://img.shields.io/npm/dm/solopdf-cli.svg)](https://www.npmjs.com/package/solopdf-cli)
[![license](https://img.shields.io/npm/l/solopdf-cli.svg)](https://github.com/soloflow-ai/solopdf-cli/blob/main/LICENSE)
[![build status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/soloflow-ai/solopdf-cli)
[![node version](https://img.shields.io/node/v/solopdf-cli.svg)](https://nodejs.org)
[![rust](https://img.shields.io/badge/powered%20by-rust-orange.svg)](https://www.rust-lang.org/)

A blazingly fast PDF manipulation CLI tool powered by Rust and Node.js.

## Features

- 🚀 **Ultra-fast**: Core operations powered by Rust for maximum performance
- 📄 **PDF Analysis**: Get page counts and basic PDF information
- ✍️ **PDF Watermarking**: Add text watermarks to PDF documents with advanced options
- 🔐 **Digital Signatures**: Create and verify cryptographic digital signatures (ECDSA P-256)
- 🔍 **File Integrity**: Generate and verify checksums for tamper detection
- 🔧 **Easy to Use**: Simple command-line interface with helpful progress indicators
- 🌐 **Cross-platform**: Works on Linux, macOS, and Windows
- 🛡️ **Secure**: Industry-standard cryptography with tamper detection

## Installation

### NPM Installation (Recommended)

```bash
npm install -g solopdf-cli
```

**Or using other package managers:**

```bash
# Using yarn
yarn global add solopdf-cli

# Using pnpm
pnpm add -g solopdf-cli
```

> **Note:** Once installed, the tool is available as both `solopdf` and `solopdf-cli` commands.

### Building from Source

> **Note:** SoloPDF CLI is currently in alpha development. To install from source:

1. **Prerequisites:**

   - Node.js 18.0.0 or higher
   - pnpm 8.0.0 or higher
   - Rust toolchain (automatically managed)

2. **Clone and build:**

```bash
git clone https://github.com/soloflow-ai/solopdf-cli.git
cd solopdf-cli
pnpm install
pnpm build:all
```

3. **Link for global usage:**

```bash
cd node-wrapper
npm link
```

4. **Test the installation:**

```bash
solopdf --help
```

## Quick Start

```bash
# Get page count of a PDF
solopdf pages document.pdf

# Get detailed PDF information
solopdf info document.pdf

# Add a watermark to a PDF
solopdf watermark input.pdf "Confidential" output.pdf

# Generate cryptographic keys for signing
solopdf generate-key -o my-keys.json

# Sign a PDF with digital signature
solopdf sign-digital contract.pdf signed-contract.pdf my-keys.json
```

## Usage

### Get Page Count

```bash
solopdf pages document.pdf
```

This will quickly analyze the PDF and return the number of pages.

### Get PDF Information

```bash
solopdf info document.pdf
```

Get detailed information about a PDF file, including page count and file path.

### Add a Watermark to a PDF

```bash
solopdf watermark input.pdf "Your Watermark Text" output.pdf
```

Add a text watermark to a PDF document. The command takes three arguments:

- `input.pdf`: The source PDF file to watermark
- `"Your Watermark Text"`: The text to include in the watermark
- `output.pdf`: The path where the watermarked PDF will be saved

**Available options for watermarking:**

- `-s, --font-size <size>`: Font size for the watermark (default: 12)
- `-c, --color <color>`: Color of the watermark text (default: black)
- `-x, --x-position <x>`: X coordinate for watermark placement
- `-y, --y-position <y>`: Y coordinate for watermark placement
- `-p, --pages <pages>`: Pages to watermark: comma-separated list (e.g., "1,3,5") or "all" (default: all)
- `-P, --position <position>`: Predefined position (default: bottom-right)
- `-r, --rotation <degrees>`: Rotation angle in degrees (default: 0)
- `-o, --opacity <opacity>`: Opacity level 0.0 to 1.0 (default: 1.0)

**Example with options:**

```bash
solopdf watermark document.pdf "DRAFT" watermarked.pdf \
  --font-size 14 \
  --position "top-right" \
  --pages "1,3" \
  --opacity 0.7
```

### Legacy Sign Command

For backward compatibility, the `sign` command is still available but deprecated:

```bash
solopdf sign input.pdf "Your Text" output.pdf
```

> **Note:** The `sign` command creates a text watermark in the PDF structure but does not create a legally-binding or verifiable digital signature. For real digital signatures, use the digital signature commands below.

## Digital Signatures 🔐

SoloPDF CLI now supports cryptographic digital signatures for PDF documents, ensuring authenticity, integrity, and non-repudiation.

### Step-by-Step Digital Signature Guide

#### Step 1: Generate a Cryptographic Key Pair

First, generate a new ECDSA P-256 key pair for signing:

```bash
solopdf generate-key
```

This will output:

- **Private Key**: Keep this secret and secure! You'll need it to sign documents.
- **Public Key**: Share this with others to verify your signatures.
- **Fingerprint**: A unique identifier for your key pair.

**⚠️ Important**: Save your private key securely - you cannot recover it if lost!

#### Step 2: Sign a PDF Document

Sign a PDF using your cryptographic key pair:

```bash
solopdf sign-digital input.pdf output.pdf keypair.json --text "Signed by John Doe"
```

This will:

- Generate a cryptographic signature of the document
- Add a visible signature mark on each page
- Create a signature information file (if saved with `-s` option)
- Provide tamper detection capabilities

#### Step 3: Verify the Digital Signature

Verify the authenticity of a signed PDF:

```bash
solopdf verify-signature signed.pdf signature.json keypair.json
```

This will:

- Verify the cryptographic signature
- Check if the document has been modified
- Display verification results and timestamp

#### Step 4: Additional Verification (Optional)

Get the file checksum for manual verification:

```bash
solopdf checksum signed.pdf
```

Share this checksum with recipients so they can verify file integrity.

### Digital Signature Commands

| Command            | Description                           | Syntax                                                                                         |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `generate-key`     | Generate a new cryptographic key pair | `solopdf generate-key [-o keypair.json]`                                                       |
| `sign-digital`     | Sign a PDF with digital signature     | `solopdf sign-digital <input.pdf> <output.pdf> <keypair.json> [--text <text>] [-s <sig.json>]` |
| `verify-signature` | Verify a digital signature            | `solopdf verify-signature <pdf> <signature.json> <keypair.json>`                               |
| `checksum`         | Get file checksum                     | `solopdf checksum <file.pdf>`                                                                  |

### Security Features

- **ECDSA P-256**: Industry-standard elliptic curve cryptography
- **SHA-256 Hashing**: Secure document fingerprinting
- **Tamper Detection**: Any document modification invalidates the signature
- **Timestamp**: Each signature includes creation timestamp
- **Non-repudiation**: Signatures are cryptographically linked to the signer

### Example Workflow

```bash
# 1. Generate keys
solopdf generate-key -o my-keypair.json
# Keys are saved securely in JSON format

# 2. Sign a document
solopdf sign-digital contract.pdf signed-contract.pdf my-keypair.json \
  --text "Digitally signed by Legal Dept" \
  -s contract-signature.json

# 3. Verify signature (by recipient)
solopdf verify-signature signed-contract.pdf contract-signature.json \
  my-keypair.json

# 4. Check file integrity
solopdf checksum signed-contract.pdf
```

### File Outputs

When you sign a PDF, you get:

- **Signed PDF**: The original PDF with visible signature marks
- **Signature File**: JSON file containing cryptographic signature data (if saved with `-s` option)
- **Checksum**: Short hash for quick integrity verification

## Available Commands

The CLI provides the following commands (use `solopdf --help` for more details):

| Command            | Status | Description                        | Syntax                                                                   |
| ------------------ | ------ | ---------------------------------- | ------------------------------------------------------------------------ |
| `pages`            | ✅     | Get the number of pages in a PDF   | `solopdf pages <file.pdf>`                                               |
| `info`             | ✅     | Get detailed PDF information       | `solopdf info <file.pdf>`                                                |
| `watermark`        | ✅     | Add a text watermark to a PDF      | `solopdf watermark <input.pdf> "<text>" <output.pdf> [options]`          |
| `sign`             | ⚠️     | (Legacy) Add a text watermark      | `solopdf sign <input.pdf> "<text>" <output.pdf> [options]`               |
| `generate-key`     | ✅     | Generate cryptographic key pair    | `solopdf generate-key [-o keypair.json]`                                 |
| `sign-digital`     | ✅     | Create a digital signature         | `solopdf sign-digital <input.pdf> <output.pdf> <keypair.json> [options]` |
| `verify-signature` | ✅     | Verify a digital signature         | `solopdf verify-signature <file.pdf> <sig.json> <keypair.json>`          |
| `checksum`         | ✅     | Get file checksum for verification | `solopdf checksum <file.pdf>`                                            |
| `--help`           | ✅     | Show help information              | `solopdf --help` or `solopdf <command> --help`                           |
| `--version`        | ✅     | Show version number                | `solopdf --version`                                                      |

**Legend:**

- ✅ Fully implemented and tested
- ⚠️ Deprecated (use alternatives)
- 🚧 Planned feature (not yet implemented)

## Requirements

- **Node.js** 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Memory**: ~50MB RAM for typical operations
- **Storage**: ~10MB for installation

> **Note:** The Rust core is pre-compiled and included in the package - no additional dependencies required!

## Current Status

SoloPDF CLI is currently in **alpha development** (v0.0.3). The tool is functional for core PDF operations with ongoing feature development.

### ✅ Currently Working

- **PDF Analysis**: Page counting and basic information extraction
- **Watermarking**: Advanced text watermarking with positioning, rotation, and opacity
- **Digital Signatures**: Full cryptographic signing with ECDSA P-256
- **Signature Verification**: Tamper detection and authenticity validation
- **File Integrity**: Checksum generation for manual verification
- **Cross-platform**: Pre-built binaries for Linux, macOS, and Windows

### 🚧 Planned Features (Roadmap)

- **PDF Creation**: Generate PDFs from scratch with declarative API
- **PDF Merging**: Combine multiple documents
- **PDF Splitting**: Extract pages or split into multiple files
- **HTML to PDF**: Convert web pages and HTML files
- **Text Extraction**: Parse and extract text content
- **Form Filling**: Programmatically fill interactive PDF forms
- **Advanced Editing**: Rotate, reorder, and manipulate pages
- **Image Integration**: Add images as watermarks or content
- **Optimization**: Compress and optimize file sizes

Our goal is to build a comprehensive, high-performance PDF toolkit that's both powerful for developers and accessible for everyday users.

---

## ✨ Core Features (Roadmap)

Our vision is for SoloPDF to be a one-stop shop for PDF tasks. The planned features include:

- **Create PDFs:** Generate PDFs from scratch using a simple, declarative API. Define your document structure with code for maximum flexibility and version control.
- **Modify PDFs:** Perform complex manipulations with simple commands. Merge multiple documents, split a file into individual pages, rotate pages, reorder them, or extract a specific page range.
- **Generate from HTML:** Convert any HTML file or live URL directly into a pixel-perfect PDF, preserving styles, images, and layout.
- **Customize Content:** Add text with specific fonts and formatting, overlay images as watermarks or figures, and draw basic shapes to annotate or structure your documents with precision.
- **Form Filling:** Programmatically find and fill out interactive PDF forms, saving time and automating workflows.
- **Digital Signatures:** ✅ Add cryptographically secure digital signatures to documents, ensuring authenticity and integrity.
- **Text Extraction:** Easily extract and parse text content from PDF files for data processing, indexing, or analysis.
- **Optimization:** Reduce file size for easier sharing and faster web loading by optimizing images, removing redundant data, and compressing content without sacrificing quality.

---

## 🚀 Getting Started

### Quick Installation

```bash
npm install -g solopdf-cli
```

### Quick Test

```bash
# Download a sample PDF or use your own
solopdf pages sample.pdf

# Add a watermark
solopdf watermark sample.pdf "SAMPLE" watermarked.pdf

# Get detailed info
solopdf info watermarked.pdf
```

### Building from Source (Advanced)

> **For contributors or those who want the latest development version:**

**Prerequisites:**

- Node.js (v18.x or later)
- pnpm (v8.x or later)
- Rust toolchain (auto-managed via rustup)

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/soloflow-ai/solopdf-cli.git
cd solopdf-cli

# 2. Install dependencies and build
pnpm install
pnpm build:all

# 3. Link for global usage
cd node-wrapper
npm link

# 4. Test the installation
solopdf --help
```

---

## 💻 Simple Usage (CLI) - Roadmap Vision

Here's our vision for how simple the CLI will be once fully developed. **Note:** Some of these commands are not yet implemented.

**Currently Available Commands:**

```bash
# ✅ PDF Analysis
solopdf pages document.pdf
solopdf info document.pdf

# ✅ Watermarking
solopdf watermark input.pdf "Confidential" output.pdf

# ✅ Digital Signatures
solopdf generate-key -o keys.json
solopdf sign-digital contract.pdf signed.pdf keys.json
solopdf verify-signature signed.pdf signature.json keys.json
solopdf checksum document.pdf
```

**Future Commands (Coming Soon):**

```bash
# 🚧 PDF Manipulation
solopdf merge file1.pdf file2.pdf -o merged.pdf
solopdf split large.pdf -o output-dir/
solopdf extract-pages input.pdf 1-5 -o pages.pdf

# 🚧 Content Generation
solopdf from-html https://example.com -o example.pdf
solopdf create-pdf template.json -o document.pdf

# 🚧 Text Processing
solopdf extract-text report.pdf -o report.txt
solopdf fill-form template.pdf data.json -o filled.pdf

# 🚧 Optimization
solopdf optimize large.pdf -o compressed.pdf --quality 85
solopdf repair broken.pdf -o fixed.pdf
```

---

## 🤝 Contributing

We believe in the power of community and welcome **contributions of all kinds!** This project thrives on public collaboration. Whether you're fixing a bug, proposing a new feature, improving our documentation, or simply spreading the word, your help is valued and appreciated.

### Ways to Contribute

- 🐛 **Report Issues**: Found a bug? [Open an issue](https://github.com/soloflow-ai/solopdf-cli/issues)
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 🔧 **Code Contributions**: Submit pull requests for fixes or new features
- 📚 **Documentation**: Help improve our docs and examples
- 🧪 **Testing**: Help us test on different platforms and use cases
- 💬 **Community**: Join discussions and help other users

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/your-username/solopdf-cli.git
cd solopdf-cli

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build and test locally
pnpm build:all
```

Please read our **Contributing Guide** to see how you can get involved with the project and help us make it better.

---

## � Project Stats

![GitHub stars](https://img.shields.io/github/stars/soloflow-ai/solopdf-cli?style=social)
![GitHub forks](https://img.shields.io/github/forks/soloflow-ai/solopdf-cli?style=social)
![GitHub issues](https://img.shields.io/github/issues/soloflow-ai/solopdf-cli)
![GitHub pull requests](https://img.shields.io/github/issues-pr/soloflow-ai/solopdf-cli)

---

## �📜 License

This project is licensed under the **ISC License**. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. See the `LICENSE` file for the full details.

---

## 🙏 Acknowledgements

- **Rust Community**: For the incredible `lopdf` and cryptographic libraries
- **NAPI-RS**: For seamless Rust-Node.js integration
- **Contributors**: Everyone who has helped make this project better
- **Users**: For testing, feedback, and feature requests

---

**Made with ❤️ by [Soloflow.AI](https://github.com/soloflow-ai)**

_Building the future of PDF processing, one commit at a time._
