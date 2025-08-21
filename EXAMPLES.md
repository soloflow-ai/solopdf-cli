# Examples & Use Cases 📝

Real-world examples and practical use cases for SoloPDF CLI.

## 🚀 Quick Start Examples

### Basic PDF Analysis

```bash
# Get page count
solopdf pages document.pdf

# Get detailed information
solopdf info presentation.pdf

# Verify file integrity
solopdf checksum important-contract.pdf
```

### Simple Watermarking

```bash
# Add basic watermark
solopdf watermark input.pdf "CONFIDENTIAL" output.pdf

# Watermark with custom font size
solopdf watermark report.pdf "DRAFT" draft-report.pdf --font-size 18

# Semi-transparent watermark
solopdf watermark document.pdf "SAMPLE" sample.pdf --opacity 0.3
```

### Basic Digital Signing

```bash
# Generate keys
solopdf generate-key --output company-keys.json

# Sign a document
solopdf sign-digital contract.pdf signed-contract.pdf company-keys.json

# Verify signature
solopdf verify-signature signed-contract.pdf signature.json company-keys.json
```

## 📊 Business Use Cases

### 1. Document Workflow Automation

**Scenario**: Legal firm needs to watermark all draft documents and track processing.

```bash
#!/bin/bash

# Script: process-legal-documents.sh
DRAFT_DIR="./drafts"
PROCESSED_DIR="./processed"
WATERMARK_TEXT="DRAFT - CONFIDENTIAL"

echo "🏛️  Legal Document Processing Started"

# Create processed directory
mkdir -p "$PROCESSED_DIR"

# Process all PDFs in drafts directory
for pdf_file in "$DRAFT_DIR"/*.pdf; do
    if [ -f "$pdf_file" ]; then
        filename=$(basename "$pdf_file")
        echo "📄 Processing: $filename"

        # Get page count for logging
        pages=$(solopdf pages "$pdf_file")
        echo "   Pages: $pages"

        # Add draft watermark
        solopdf watermark "$pdf_file" "$WATERMARK_TEXT" "$PROCESSED_DIR/$filename" \
            --font-size 16 \
            --color red \
            --position top-right \
            --opacity 0.7

        # Generate checksum for tracking
        checksum=$(solopdf checksum "$PROCESSED_DIR/$filename")
        echo "   Checksum: $checksum"

        echo "✅ Completed: $filename"
    fi
done

echo "🎉 All documents processed!"
```

### 2. Contract Signing Pipeline

**Scenario**: Company needs to digitally sign contracts and maintain audit trail.

```bash
#!/bin/bash

# Script: sign-contracts.sh
UNSIGNED_DIR="./contracts/unsigned"
SIGNED_DIR="./contracts/signed"
KEY_FILE="./keys/company-signing-key.json"
AUDIT_LOG="./audit/signing-log.txt"

echo "✍️  Contract Signing Pipeline"

# Ensure directories exist
mkdir -p "$SIGNED_DIR" "./audit"

# Initialize audit log
echo "$(date): Starting contract signing batch" >> "$AUDIT_LOG"

for contract in "$UNSIGNED_DIR"/*.pdf; do
    if [ -f "$contract" ]; then
        filename=$(basename "$contract" .pdf)
        signed_file="$SIGNED_DIR/${filename}_signed.pdf"
        signature_info="./audit/${filename}_signature.json"

        echo "📄 Signing: $filename"

        # Sign the contract
        solopdf sign-digital "$contract" "$signed_file" "$KEY_FILE" \
            --text "Digitally signed by Acme Corp" \
            --save-sig "$signature_info"

        # Log the signing
        checksum=$(solopdf checksum "$signed_file")
        echo "$(date): Signed $filename - Checksum: $checksum" >> "$AUDIT_LOG"

        # Verify the signature immediately
        if solopdf verify-signature "$signed_file" "$signature_info" "$KEY_FILE" > /dev/null; then
            echo "✅ Verified: $filename"
            echo "$(date): Verified $filename successfully" >> "$AUDIT_LOG"
        else
            echo "❌ Verification failed: $filename"
            echo "$(date): ERROR - Verification failed for $filename" >> "$AUDIT_LOG"
        fi
    fi
done

echo "📋 Signing completed. Check audit log: $AUDIT_LOG"
```

### 3. Batch Document Watermarking

**Scenario**: Marketing team needs to watermark promotional materials by category.

```bash
#!/bin/bash

# Script: marketing-watermark.sh
BASE_DIR="./marketing-materials"
OUTPUT_DIR="./watermarked-materials"

# Different watermarks for different types
declare -A WATERMARKS
WATERMARKS["brochures"]="PROMOTIONAL MATERIAL"
WATERMARKS["presentations"]="INTERNAL USE ONLY"
WATERMARKS["reports"]="CONFIDENTIAL - DO NOT DISTRIBUTE"

echo "🎨 Marketing Material Watermarking"

for category in "${!WATERMARKS[@]}"; do
    watermark_text="${WATERMARKS[$category]}"
    input_dir="$BASE_DIR/$category"
    output_dir="$OUTPUT_DIR/$category"

    if [ -d "$input_dir" ]; then
        echo "📁 Processing category: $category"
        mkdir -p "$output_dir"

        for pdf in "$input_dir"/*.pdf; do
            if [ -f "$pdf" ]; then
                filename=$(basename "$pdf")
                output_file="$output_dir/$filename"

                echo "   🔖 Watermarking: $filename"

                # Different styles per category
                case $category in
                    "brochures")
                        solopdf watermark "$pdf" "$watermark_text" "$output_file" \
                            --font-size 14 --color blue --position bottom-center \
                            --opacity 0.6
                        ;;
                    "presentations")
                        solopdf watermark "$pdf" "$watermark_text" "$output_file" \
                            --font-size 12 --color gray --position top-right \
                            --pages odd
                        ;;
                    "reports")
                        solopdf watermark "$pdf" "$watermark_text" "$output_file" \
                            --font-size 18 --color red --position center \
                            --rotation 45 --opacity 0.3
                        ;;
                esac

                echo "   ✅ Done: $filename"
            fi
        done
    fi
done

echo "🎉 All marketing materials processed!"
```

## 🔧 Advanced Examples

### 4. Custom Page Range Watermarking

**Scenario**: Add different watermarks to different sections of a document.

```bash
#!/bin/bash

# Script: section-watermarking.sh
DOCUMENT="./manual.pdf"
OUTPUT="./watermarked-manual.pdf"

echo "📖 Section-based watermarking for: $DOCUMENT"

# Get total pages
TOTAL_PAGES=$(solopdf pages "$DOCUMENT")
echo "📄 Total pages: $TOTAL_PAGES"

# Copy original to work with
cp "$DOCUMENT" "$OUTPUT"

# Table of contents (pages 1-3): "TABLE OF CONTENTS"
echo "🔖 Watermarking: Table of Contents (pages 1-3)"
solopdf watermark "$OUTPUT" "TABLE OF CONTENTS" "$OUTPUT" \
    --pages "1,2,3" \
    --font-size 10 \
    --position bottom-center \
    --opacity 0.5

# Main content (pages 4-20): "INTERNAL DOCUMENT"
echo "🔖 Watermarking: Main content (pages 4-20)"
solopdf watermark "$OUTPUT" "INTERNAL DOCUMENT" "$OUTPUT" \
    --pages "4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20" \
    --font-size 12 \
    --position top-right \
    --opacity 0.7

# Appendices (remaining pages): "APPENDIX"
REMAINING_PAGES=""
for i in $(seq 21 $TOTAL_PAGES); do
    REMAINING_PAGES="$REMAINING_PAGES,$i"
done
REMAINING_PAGES=${REMAINING_PAGES#,}  # Remove leading comma

if [ ! -z "$REMAINING_PAGES" ]; then
    echo "🔖 Watermarking: Appendices (pages $REMAINING_PAGES)"
    solopdf watermark "$OUTPUT" "APPENDIX" "$OUTPUT" \
        --pages "$REMAINING_PAGES" \
        --font-size 14 \
        --position center-left \
        --opacity 0.6
fi

echo "✅ Section watermarking completed: $OUTPUT"
```

### 5. Document Integrity Monitoring

**Scenario**: Monitor document integrity over time with checksums.

```javascript
#!/usr/bin/env node
// Script: document-monitor.js

import { getPdfChecksum, getPageCount } from "solopdf-cli";
import fs from "fs";
import path from "path";

class DocumentMonitor {
  constructor(configFile = "./document-monitor.json") {
    this.configFile = configFile;
    this.documents = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, "utf8"));
      }
    } catch (error) {
      console.warn("Could not load config, starting fresh");
    }
    return {};
  }

  saveConfig() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.documents, null, 2));
  }

  addDocument(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    console.log(`📄 Adding document: ${path.basename(absolutePath)}`);

    const checksum = getPdfChecksum(absolutePath);
    const pages = getPageCount(absolutePath);
    const stats = fs.statSync(absolutePath);

    this.documents[absolutePath] = {
      checksum: checksum,
      pages: pages,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      lastChecked: new Date().toISOString(),
      status: "baseline",
    };

    this.saveConfig();
    console.log(`✅ Baseline established for ${path.basename(absolutePath)}`);
    console.log(`   Pages: ${pages}, Size: ${stats.size} bytes`);
    console.log(`   Checksum: ${checksum.substring(0, 16)}...`);
  }

  checkDocument(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!this.documents[absolutePath]) {
      console.log(`❓ Document not monitored: ${path.basename(absolutePath)}`);
      return null;
    }

    const baseline = this.documents[absolutePath];
    const currentChecksum = getPdfChecksum(absolutePath);
    const currentPages = getPageCount(absolutePath);
    const currentStats = fs.statSync(absolutePath);

    const result = {
      path: absolutePath,
      status: "unchanged",
      changes: [],
      currentChecksum,
      currentPages,
      currentSize: currentStats.size,
      lastModified: currentStats.mtime.toISOString(),
    };

    // Check for changes
    if (currentChecksum !== baseline.checksum) {
      result.status = "modified";
      result.changes.push("Content changed (checksum mismatch)");
    }

    if (currentPages !== baseline.pages) {
      result.status = "modified";
      result.changes.push(
        `Page count changed: ${baseline.pages} → ${currentPages}`
      );
    }

    if (currentStats.size !== baseline.size) {
      result.status = "modified";
      result.changes.push(
        `File size changed: ${baseline.size} → ${currentStats.size} bytes`
      );
    }

    if (new Date(currentStats.mtime) > new Date(baseline.lastModified)) {
      if (result.changes.length === 0) {
        result.changes.push(
          "File timestamp updated (no content changes detected)"
        );
      }
    }

    // Update tracking
    this.documents[absolutePath].lastChecked = new Date().toISOString();
    this.documents[absolutePath].status = result.status;
    this.saveConfig();

    return result;
  }

  checkAll() {
    console.log("🔍 Checking all monitored documents...\n");

    const results = [];

    for (const filePath of Object.keys(this.documents)) {
      if (fs.existsSync(filePath)) {
        const result = this.checkDocument(filePath);
        results.push(result);

        if (result.status === "unchanged") {
          console.log(`✅ ${path.basename(filePath)}: No changes`);
        } else {
          console.log(`⚠️  ${path.basename(filePath)}: MODIFIED`);
          result.changes.forEach((change) => {
            console.log(`   - ${change}`);
          });
        }
      } else {
        console.log(`❌ ${path.basename(filePath)}: File not found`);
        results.push({
          path: filePath,
          status: "missing",
          changes: ["File deleted or moved"],
        });
      }
    }

    // Summary
    const unchanged = results.filter((r) => r.status === "unchanged").length;
    const modified = results.filter((r) => r.status === "modified").length;
    const missing = results.filter((r) => r.status === "missing").length;

    console.log(
      `\n📊 Summary: ${unchanged} unchanged, ${modified} modified, ${missing} missing`
    );

    return results;
  }

  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      totalDocuments: Object.keys(this.documents).length,
      documents: {},
    };

    for (const [filePath, info] of Object.entries(this.documents)) {
      report.documents[path.basename(filePath)] = {
        path: filePath,
        status: info.status,
        pages: info.pages,
        size: info.size,
        checksum: info.checksum,
        lastModified: info.lastModified,
        lastChecked: info.lastChecked,
      };
    }

    const reportFile = `./integrity-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📋 Report saved: ${reportFile}`);

    return reportFile;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new DocumentMonitor();
  const command = process.argv[2];
  const filePath = process.argv[3];

  try {
    switch (command) {
      case "add":
        if (!filePath) {
          console.error("Usage: node document-monitor.js add <file.pdf>");
          process.exit(1);
        }
        monitor.addDocument(filePath);
        break;

      case "check":
        if (filePath) {
          const result = monitor.checkDocument(filePath);
          if (result) {
            console.log(`Status: ${result.status}`);
            if (result.changes.length > 0) {
              console.log("Changes:", result.changes);
            }
          }
        } else {
          monitor.checkAll();
        }
        break;

      case "report":
        monitor.generateReport();
        break;

      default:
        console.log("Document Integrity Monitor");
        console.log("Usage:");
        console.log(
          "  node document-monitor.js add <file.pdf>     - Add document to monitoring"
        );
        console.log(
          "  node document-monitor.js check [file.pdf]   - Check document(s)"
        );
        console.log(
          "  node document-monitor.js report             - Generate integrity report"
        );
        break;
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

export default DocumentMonitor;
```

**Usage:**

```bash
# Add documents to monitoring
node document-monitor.js add ./important/contract.pdf
node document-monitor.js add ./important/policy.pdf

# Check all documents
node document-monitor.js check

# Check specific document
node document-monitor.js check ./important/contract.pdf

# Generate integrity report
node document-monitor.js report
```

## 🏢 Enterprise Integration Examples

### 6. CI/CD Pipeline Integration

**Scenario**: Automatically process documents in a continuous integration pipeline.

```yaml
# .github/workflows/document-processing.yml
name: Document Processing Pipeline

on:
  push:
    paths: ["documents/**/*.pdf"]
  pull_request:
    paths: ["documents/**/*.pdf"]

jobs:
  process-documents:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install SoloPDF CLI
        run: npm install -g solopdf-cli

      - name: Verify installation
        run: solopdf --version

      - name: Process documents
        run: |
          echo "🔍 Scanning for PDF documents..."

          # Find all PDFs in documents directory
          find documents -name "*.pdf" -type f > pdf_list.txt

          if [ -s pdf_list.txt ]; then
            echo "📄 Found PDFs to process:"
            cat pdf_list.txt
            
            # Process each PDF
            while IFS= read -r pdf_file; do
              echo "Processing: $pdf_file"
              
              # Get page count
              pages=$(solopdf pages "$pdf_file")
              echo "  Pages: $pages"
              
              # Generate checksum for tracking
              checksum=$(solopdf checksum "$pdf_file")
              echo "  Checksum: $checksum"
              
              # Add watermark if it's a draft
              if [[ "$pdf_file" == *"draft"* ]]; then
                echo "  Adding draft watermark..."
                cp "$pdf_file" "${pdf_file%.pdf}_original.pdf"
                solopdf watermark "$pdf_file" "DRAFT - NOT FOR DISTRIBUTION" "$pdf_file" \
                  --font-size 16 --color red --position center --opacity 0.3
              fi
              
            done < pdf_list.txt
            
            echo "✅ Document processing completed"
          else
            echo "ℹ️  No PDF documents found"
          fi

      - name: Commit processed documents
        if: github.event_name == 'push'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add documents/
          git diff --staged --quiet || git commit -m "Auto-process PDF documents [skip ci]"
          git push
```

### 7. REST API Integration

**Scenario**: Create a web service for PDF processing.

```javascript
// server.js - Express.js API server
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getPageCount,
  signPdfWithOptions,
  getPdfChecksum,
  generateSigningKeyPair,
  signPdfWithKey,
  verifyPdfSignature,
} from "solopdf-cli";

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// PDF Analysis endpoints
app.post("/api/pdf/analyze", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const pages = getPageCount(filePath);
    const checksum = getPdfChecksum(filePath);
    const stats = fs.statSync(filePath);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      filename: req.file.originalname,
      pages: pages,
      size: stats.size,
      checksum: checksum,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Watermarking endpoint
app.post("/api/pdf/watermark", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const {
      text,
      fontSize = 12,
      color = "black",
      position = "bottom-right",
      opacity = 1.0,
    } = req.body;

    if (!text) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Watermark text is required" });
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(".pdf", "_watermarked.pdf");

    // Copy file for watermarking
    fs.copyFileSync(inputPath, outputPath);

    // Apply watermark
    const options = {
      fontSize: parseInt(fontSize),
      color: color,
      position: position,
      opacity: parseFloat(opacity),
    };

    signPdfWithOptions(outputPath, text, options);

    // Send the watermarked file
    res.download(outputPath, `watermarked_${req.file.originalname}`, (err) => {
      // Clean up files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Watermarking error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Key generation endpoint
app.post("/api/crypto/generate-keys", async (req, res) => {
  try {
    const keyPairJson = generateSigningKeyPair();
    const keyPair = JSON.parse(keyPairJson);

    // Return only public key info, keep private key secure
    res.json({
      fingerprint: keyPair.fingerprint,
      publicKey: keyPair.public_key,
      created: keyPair.created_at,
      message: "Private key generated but not returned for security",
    });
  } catch (error) {
    console.error("Key generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Digital signing endpoint
app.post("/api/pdf/sign", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { privateKey, signatureText = "Digitally Signed" } = req.body;

    if (!privateKey) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Private key is required" });
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(".pdf", "_signed.pdf");

    // Sign the PDF
    const signatureInfo = signPdfWithKey(
      inputPath,
      outputPath,
      privateKey,
      signatureText
    );

    // Send the signed file
    res.download(outputPath, `signed_${req.file.originalname}`, (err) => {
      // Clean up files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Signing error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }

  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`🚀 SoloPDF API server running on port ${port}`);
  console.log(`📖 API endpoints available:`);
  console.log(`   POST /api/pdf/analyze - Analyze PDF file`);
  console.log(`   POST /api/pdf/watermark - Add watermark to PDF`);
  console.log(`   POST /api/crypto/generate-keys - Generate signing keys`);
  console.log(`   POST /api/pdf/sign - Digitally sign PDF`);
});
```

**Usage examples:**

```bash
# Analyze a PDF
curl -X POST -F "pdf=@document.pdf" http://localhost:3000/api/pdf/analyze

# Add watermark
curl -X POST -F "pdf=@document.pdf" -F "text=CONFIDENTIAL" -F "fontSize=16" \
  http://localhost:3000/api/pdf/watermark --output watermarked.pdf

# Generate keys
curl -X POST http://localhost:3000/api/crypto/generate-keys
```

## 🎯 Specialized Use Cases

### 8. Academic Paper Processing

**Scenario**: University needs to watermark thesis submissions and track versions.

```javascript
#!/usr/bin/env node
// thesis-processor.js

import { getPageCount, signPdfWithOptions, getPdfChecksum } from "solopdf-cli";
import fs from "fs";
import path from "path";

class ThesisProcessor {
  constructor(baseDir = "./thesis-submissions") {
    this.baseDir = baseDir;
    this.processedDir = path.join(baseDir, "processed");
    this.logFile = path.join(baseDir, "processing-log.json");
    this.log = this.loadLog();

    // Ensure directories exist
    fs.mkdirSync(this.processedDir, { recursive: true });
  }

  loadLog() {
    try {
      if (fs.existsSync(this.logFile)) {
        return JSON.parse(fs.readFileSync(this.logFile, "utf8"));
      }
    } catch (error) {
      console.warn("Could not load processing log");
    }
    return { submissions: {}, stats: { processed: 0, total: 0 } };
  }

  saveLog() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.log, null, 2));
  }

  processSubmission(filePath, studentInfo) {
    const { studentId, studentName, department, submissionDate, degree } =
      studentInfo;

    console.log(`🎓 Processing thesis: ${studentName} (${studentId})`);

    // Validate file
    if (!fs.existsSync(filePath)) {
      throw new Error(`Thesis file not found: ${filePath}`);
    }

    // Get PDF info
    const pages = getPageCount(filePath);
    const originalChecksum = getPdfChecksum(filePath);

    console.log(`   📄 Pages: ${pages}`);
    console.log(
      `   🔐 Original checksum: ${originalChecksum.substring(0, 16)}...`
    );

    // Create watermark text with submission info
    const watermarkText = [
      `${studentName} (${studentId})`,
      `${department} - ${degree}`,
      `Submitted: ${submissionDate}`,
    ].join(" | ");

    // Generate output filename
    const originalName = path.basename(filePath, ".pdf");
    const outputFileName = `${studentId}_${originalName}_processed.pdf`;
    const outputPath = path.join(this.processedDir, outputFileName);

    // Copy original and add watermarks
    fs.copyFileSync(filePath, outputPath);

    // First page: Title watermark
    signPdfWithOptions(outputPath, `${studentName} - ${degree} Thesis`, {
      fontSize: 14,
      color: "blue",
      position: "bottom-center",
      pages: [1],
      opacity: 0.7,
    });

    // All pages: Footer with submission info
    signPdfWithOptions(outputPath, watermarkText, {
      fontSize: 8,
      color: "gray",
      position: "bottom-left",
      opacity: 0.6,
    });

    // Even pages only: "CONFIDENTIAL" diagonal watermark
    const evenPages = Array.from(
      { length: Math.floor(pages / 2) },
      (_, i) => (i + 1) * 2
    ).filter((p) => p <= pages);

    if (evenPages.length > 0) {
      signPdfWithOptions(outputPath, "CONFIDENTIAL", {
        fontSize: 24,
        color: "red",
        position: "center",
        rotation: 45,
        opacity: 0.2,
        pages: evenPages,
      });
    }

    // Generate processed checksum
    const processedChecksum = getPdfChecksum(outputPath);

    // Record processing
    const submission = {
      studentId,
      studentName,
      department,
      degree,
      submissionDate,
      originalFile: filePath,
      processedFile: outputPath,
      pages,
      originalChecksum,
      processedChecksum,
      processedAt: new Date().toISOString(),
      watermarks: [
        "Title watermark on first page",
        "Submission info footer on all pages",
        "Confidential watermark on even pages",
      ],
    };

    this.log.submissions[studentId] = submission;
    this.log.stats.processed++;
    this.log.stats.total++;
    this.saveLog();

    console.log(`✅ Processed: ${outputFileName}`);
    console.log(`   🔐 New checksum: ${processedChecksum.substring(0, 16)}...`);

    return submission;
  }

  batchProcess(submissionsCsv) {
    console.log("🎓 Starting batch thesis processing...\n");

    const csvContent = fs.readFileSync(submissionsCsv, "utf8");
    const lines = csvContent.split("\n").slice(1); // Skip header

    for (const line of lines) {
      if (line.trim()) {
        const [
          studentId,
          studentName,
          department,
          degree,
          submissionDate,
          filePath,
        ] = line.split(",").map((field) => field.trim().replace(/^"|"$/g, ""));

        try {
          this.processSubmission(filePath, {
            studentId,
            studentName,
            department,
            degree,
            submissionDate,
          });
        } catch (error) {
          console.error(
            `❌ Error processing ${studentName} (${studentId}):`,
            error.message
          );
          this.log.submissions[studentId] = {
            studentId,
            studentName,
            error: error.message,
            processedAt: new Date().toISOString(),
          };
        }
      }
    }

    this.generateReport();
  }

  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalSubmissions: this.log.stats.total,
        successfullyProcessed: this.log.stats.processed,
        failed: this.log.stats.total - this.log.stats.processed,
      },
      submissions: Object.values(this.log.submissions),
      departments: {},
      degrees: {},
    };

    // Aggregate by department and degree
    for (const submission of report.submissions) {
      if (submission.department) {
        report.departments[submission.department] =
          (report.departments[submission.department] || 0) + 1;
      }
      if (submission.degree) {
        report.degrees[submission.degree] =
          (report.degrees[submission.degree] || 0) + 1;
      }
    }

    const reportFile = path.join(
      this.baseDir,
      `thesis-processing-report-${Date.now()}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log("\n📊 Processing Summary:");
    console.log(`   Total submissions: ${report.summary.totalSubmissions}`);
    console.log(
      `   Successfully processed: ${report.summary.successfullyProcessed}`
    );
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Report saved: ${reportFile}`);

    return reportFile;
  }

  verifySubmission(studentId) {
    const submission = this.log.submissions[studentId];
    if (!submission) {
      console.log(`❌ No submission found for student ID: ${studentId}`);
      return null;
    }

    if (submission.error) {
      console.log(`❌ Submission failed: ${submission.error}`);
      return null;
    }

    console.log(
      `🔍 Verifying submission for ${submission.studentName} (${studentId})`
    );

    // Check if processed file exists
    if (!fs.existsSync(submission.processedFile)) {
      console.log(`❌ Processed file not found: ${submission.processedFile}`);
      return false;
    }

    // Verify checksum
    const currentChecksum = getPdfChecksum(submission.processedFile);
    if (currentChecksum !== submission.processedChecksum) {
      console.log(`❌ Checksum mismatch! File may have been modified.`);
      console.log(`   Expected: ${submission.processedChecksum}`);
      console.log(`   Current:  ${currentChecksum}`);
      return false;
    }

    console.log(`✅ Submission verified successfully`);
    console.log(`   File: ${submission.processedFile}`);
    console.log(`   Checksum: ${currentChecksum.substring(0, 16)}...`);
    console.log(`   Processed: ${submission.processedAt}`);

    return true;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new ThesisProcessor();
  const command = process.argv[2];

  try {
    switch (command) {
      case "single":
        const filePath = process.argv[3];
        const studentInfo = {
          studentId: process.argv[4],
          studentName: process.argv[5],
          department: process.argv[6],
          degree: process.argv[7],
          submissionDate:
            process.argv[8] || new Date().toISOString().split("T")[0],
        };

        if (!filePath || !studentInfo.studentId) {
          console.log(
            "Usage: node thesis-processor.js single <file> <studentId> <name> <dept> <degree> [date]"
          );
          process.exit(1);
        }

        processor.processSubmission(filePath, studentInfo);
        break;

      case "batch":
        const csvFile = process.argv[3];
        if (!csvFile) {
          console.log(
            "Usage: node thesis-processor.js batch <submissions.csv>"
          );
          process.exit(1);
        }
        processor.batchProcess(csvFile);
        break;

      case "verify":
        const studentId = process.argv[3];
        if (!studentId) {
          console.log("Usage: node thesis-processor.js verify <studentId>");
          process.exit(1);
        }
        processor.verifySubmission(studentId);
        break;

      case "report":
        processor.generateReport();
        break;

      default:
        console.log("🎓 Thesis Processing System");
        console.log("Usage:");
        console.log(
          "  single <file> <id> <name> <dept> <degree> [date] - Process single thesis"
        );
        console.log(
          "  batch <submissions.csv>                          - Process batch from CSV"
        );
        console.log(
          "  verify <studentId>                               - Verify processed submission"
        );
        console.log(
          "  report                                           - Generate processing report"
        );
        break;
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

export default ThesisProcessor;
```

**CSV format for batch processing (submissions.csv):**

```csv
studentId,studentName,department,degree,submissionDate,filePath
ST12345,John Smith,Computer Science,PhD,2025-01-15,./submissions/smith_thesis.pdf
ST67890,Jane Doe,Mathematics,Masters,2025-01-16,./submissions/doe_thesis.pdf
```

**Usage:**

```bash
# Process single submission
node thesis-processor.js single ./thesis.pdf ST12345 "John Smith" "Computer Science" "PhD" "2025-01-15"

# Process batch submissions
node thesis-processor.js batch submissions.csv

# Verify a submission
node thesis-processor.js verify ST12345

# Generate report
node thesis-processor.js report
```

---

These examples demonstrate the versatility and power of SoloPDF CLI in real-world scenarios. Each example can be adapted and extended based on specific requirements and workflows.

**Need more examples?** Check our [GitHub discussions](https://github.com/soloflow-ai/solopdf-cli/discussions) or [create an issue](https://github.com/soloflow-ai/solopdf-cli/issues) with your use case!
