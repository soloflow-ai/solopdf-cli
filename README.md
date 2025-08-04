# SoloPDF CLI 📄✨

A blazingly fast PDF manipulation CLI tool powered by Rust and Node.js.

## Features

- 🚀 **Ultra-fast**: Core operations powered by Rust for maximum performance
- 📄 **PDF Analysis**: Get page counts and basic PDF information
- ✍️ **PDF Signing**: Add signature fields to PDF documents
- 🔧 **Easy to Use**: Simple command-line interface
- 🌐 **Cross-platform**: Works on Linux, macOS, and Windows

## Installation

```bash
npm install -g solopdf-cli
```

or with pnpm:

```bash
pnpm install -g solopdf-cli
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

### Sign a PDF

```bash
solopdf sign document.pdf "Your Signature Text"
```

Add a signature field to a PDF document with the specified signature text.

**Note:** This creates a signature field in the PDF structure but does not create a legally-binding or verifiable digital signature. For real digital signatures, cryptographic capabilities are required.

## Requirements

- Node.js 18.0.0 or higher
- The Rust core is pre-compiled and included in the package

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
- `npm` or `yarn`

### Installation

```bash
npm install -g solopdf
```

---

## 💻 Simple Usage (CLI)

Here’s a sneak peek at how simple we want the CLI to be. The focus is on clear, memorable commands that get the job done with minimal fuss.

**Merge two PDFs:**

```bash
solopdf merge -in file1.pdf file2.pdf -out merged.pdf
```

**Convert HTML to PDF:**

```bash
solopdf from-html -in https://example.com -out example.pdf
```

**Add a signature:**

```bash
solopdf sign -in document.pdf -signature signature.png -pos "bottom-right" -out signed.pdf
```

**Extract text from a PDF:**

```bash
solopdf extract-text -in report.pdf -out report.txt
```

---

## 🤝 Contributing

We believe in the power of community and welcome **contributions of all kinds\!** This project thrives on public collaboration. Whether you're fixing a bug, proposing a new feature, improving our documentation, or simply spreading the word, your help is valued and appreciated.

Please read our **Contributing Guide** to see how you can get involved with the project and help us make it better.

---

## 📜 License

This project is licensed under the **MIT License**. This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. See the `LICENSE` file for the full details.

Made with ❤️ by Soloflow.AI
