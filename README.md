# SoloPDF CLI 📄✨

A blazingly fast PDF manipulation CLI tool powered by Rust and Node.js.

## Features

- 🚀 **Ultra-fast**: Core operations powered by Rust for maximum performance
- 📄 **PDF Analysis**: Get page counts and basic PDF information
- ✍️ **PDF Watermarking**: Add text watermarks to PDF documents
- 🔐 **Digital Signatures**: Create and verify cryptographic digital signatures
- 🔧 **Easy to Use**: Simple command-line interface
- 🌐 **Cross-platform**: Works on Linux, macOS, and Windows

## Installation

> **Note:** SoloPDF CLI is currently in alpha development. To install from source:

1. Clone the repository:

```bash
git clone https://github.com/soloflow-ai/solopdf-cli.git
cd solopdf-cli
```

2. Install dependencies and build:

```bash
pnpm install
pnpm build:all
```

3. Link for global usage:

```bash
cd node-wrapper
npm link
```

**NPM Installation**:

```bash
npm install -g solopdf-cli
```

> **Note:** Once installed, the tool is available as both `solopdf` and `solopdf-cli` commands.

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
solopdf watermark document.pdf "John Doe" watermarked.pdf --font-size 14 --position "top-right" --pages "1,3"
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

| Command            | Description                        | Syntax                                                                   |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| `pages`            | Get the number of pages in a PDF   | `solopdf pages <file.pdf>`                                               |
| `info`             | Get detailed PDF information       | `solopdf info <file.pdf>`                                                |
| `watermark`        | Add a text watermark to a PDF      | `solopdf watermark <input.pdf> "<text>" <output.pdf> [options]`          |
| `sign`             | (Legacy) Add a text watermark      | `solopdf sign <input.pdf> "<text>" <output.pdf> [options]`               |
| `generate-key`     | Generate cryptographic key pair    | `solopdf generate-key [-o keypair.json]`                                 |
| `sign-digital`     | Create a digital signature         | `solopdf sign-digital <input.pdf> <output.pdf> <keypair.json> [options]` |
| `verify-signature` | Verify a digital signature         | `solopdf verify-signature <file.pdf> <sig.json> <keypair.json>`          |
| `checksum`         | Get file checksum for verification | `solopdf checksum <file.pdf>`                                            |
| `--help`           | Show help information              | `solopdf --help` or `solopdf <command> --help`                           |
| `--version`        | Show version number                | `solopdf --version`                                                      |

## Requirements

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher (for building from source)
- The Rust core is pre-compiled and included in the package

## Current Status

SoloPDF CLI is currently in **alpha development**. The tool is functional for basic PDF operations but the API and CLI are subject to change as we build and refine the tool.

Our goal is to build a tool that is not only feature-rich but also incredibly easy to integrate into your projects or use directly from the terminal. We are building this project in the open, sharing our progress, and we welcome contributors of all levels to join us on this journey to build the best PDF tool available.

---

## ✨ Core Features (Roadmap)

Our vision is for SoloPDF to be a one-stop shop for PDF tasks. The planned features include:

- **Create PDFs:** Generate PDFs from scratch using a simple, declarative API. Define your document structure with code for maximum flexibility and version control.
- **Modify PDFs:** Perform complex manipulations with simple commands. Merge multiple documents, split a file into individual pages, rotate pages, reorder them, or extract a specific page range.
- **Generate from HTML:** Convert any HTML file or live URL directly into a pixel-perfect PDF, preserving styles, images, and layout.
- **Customize Content:** Add text with specific fonts and formatting, overlay images as watermarks or figures, and draw basic shapes to annotate or structure your documents with precision.
- **Form Filling:** Programmatically find and fill out interactive PDF forms, saving time and automating workflows.
- **Digital Signatures:** Add cryptographically secure digital signatures to documents, ensuring authenticity and integrity.
- **Text Extraction:** Easily extract and parse text content from PDF files for data processing, indexing, or analysis.
- **Optimization:** Reduce file size for easier sharing and faster web loading by optimizing images, removing redundant data, and compressing content without sacrificing quality.

---

## 🚀 Getting Started

> **Note:** SoloPDF is currently in active development. The API and CLI are subject to change as we build and refine the tool. We recommend checking back frequently for updates.

### Prerequisites

- Node.js (v18.x or later)
- pnpm (v8.x or later)

### Building from Source

1. Clone the repository:

```bash
git clone https://github.com/soloflow-ai/solopdf-cli.git
cd solopdf-cli
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the Rust core and Node.js wrapper:

```bash
pnpm build:all
```

4. Link for global usage:

```bash
cd node-wrapper
npm link
```

5. Test the installation:

```bash
solopdf --help
```

### Quick Start

Once installed, you can use these commands:

```bash
# Get page count of a PDF
solopdf pages sample.pdf

# Get detailed PDF information
solopdf info sample.pdf

# Sign a PDF with text
solopdf sign input.pdf "Signed by John Doe" output.pdf
```

---

## 💻 Simple Usage (CLI) - Roadmap Vision

Here's our vision for how simple the CLI will be once fully developed. **Note:** Most of these commands are not yet implemented. Currently available: `pages`, `info`, and `sign`.

**Merge two PDFs:** _(Coming soon)_

```bash
solopdf merge -in file1.pdf file2.pdf -out merged.pdf
```

**Convert HTML to PDF:** _(Coming soon)_

```bash
solopdf from-html -in https://example.com -out example.pdf
```

**Add a signature:** _(Currently available with different syntax)_

```bash
solopdf sign -in document.pdf -signature signature.png -pos "bottom-right" -out signed.pdf
```

_Current syntax:_ `solopdf sign input.pdf "signature text" output.pdf`

**Extract text from a PDF:** _(Coming soon)_

```bash
solopdf extract-text -in report.pdf -out report.txt
```

---

## 🤝 Contributing

We believe in the power of community and welcome **contributions of all kinds\!** This project thrives on public collaboration. Whether you're fixing a bug, proposing a new feature, improving our documentation, or simply spreading the word, your help is valued and appreciated.

Please read our **Contributing Guide** to see how you can get involved with the project and help us make it better.

---

## 📜 License

This project is licensed under the **ISC License**. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. See the `LICENSE` file for the full details.

Made with ❤️ by Soloflow.AI
