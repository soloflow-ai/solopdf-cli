# SoloPDF CLI 📄✨

A blazingly fast PDF manipulation CLI tool powered by Rust and Node.js.

## Features

- 🚀 **Ultra-fast**: Core operations powered by Rust for maximum performance
- 📄 **PDF Analysis**: Get page counts and basic PDF information
- ✍️ **PDF Signing**: Add signature fields to PDF documents
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

### Sign a PDF

```bash
solopdf watermark input.pdf "Your Signature Text" output.pdf
```

Add a watermark to a PDF document with the specified text. The command takes three arguments:

- `input.pdf`: The source PDF file to watermark
- `"Your Signature Text"`: The text to include in the watermark
- `output.pdf`: The path where the watermarked PDF will be saved

**Available options for watermarking:**

- `--font-size <size>`: Font size for the watermark (default: 12)
- `--color <color>`: Color of the watermark text (default: black)
- `--x-position <x>`: X coordinate for watermark placement
- `--y-position <y>`: Y coordinate for watermark placement
- `--pages <pages>`: Pages to watermark (default: all)
  - `all` - watermark all pages
  - `even` - watermark only even pages
  - `odd` - watermark only odd pages  
  - `"1,2,5"` - watermark specific pages (comma-separated)
- `--position <position>`: Predefined position (default: bottom-right)
- `--rotation <degrees>`: Rotation angle in degrees (default: 0)
- `--opacity <opacity>`: Opacity level 0.0 to 1.0 (default: 1.0)

**Example with options:**

```bash
solopdf watermark document.pdf "John Doe" signed.pdf --font-size 14 --position "top-right" --pages "odd"
```

## Available Commands

The CLI provides the following commands (use `solopdf --help` for more details):

| Command     | Description                      | Syntax                                                          |
| ----------- | -------------------------------- | --------------------------------------------------------------- |
| `pages`     | Get the number of pages in a PDF | `solopdf pages <file.pdf>`                                      |
| `info`      | Get detailed PDF information     | `solopdf info <file.pdf>`                                       |
| `watermark` | Add a watermark to a PDF         | `solopdf watermark <input.pdf> "<text>" <output.pdf> [options]` |
| `--help`    | Show help information            | `solopdf --help` or `solopdf <command> --help`                  |
| `--version` | Show version number              | `solopdf --version`                                             |

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

- Node.js (v22.x or later)
- pnpm (v10.x or later)

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
