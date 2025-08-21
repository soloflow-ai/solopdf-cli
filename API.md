# API Documentation 📚

Complete API reference for SoloPDF CLI functions and interfaces.

## 🔗 Node.js API

### Installation

```bash
npm install solopdf-cli
```

### Import

```javascript
// ES Modules (recommended)
import {
  getPageCount,
  signPdfWithOptions,
  getPdfInfoBeforeSigning,
  generateSigningKeyPair,
  signPdfWithKey,
  verifyPdfSignature,
  getPdfChecksum,
  getKeyInfoFromJson,
} from "solopdf-cli";

// CommonJS
const {
  getPageCount,
  signPdfWithOptions,
  // ... other functions
} = require("solopdf-cli");
```

## 📊 PDF Analysis Functions

### `getPageCount(filePath: string): number`

Get the number of pages in a PDF document.

**Parameters:**

- `filePath` (string): Absolute path to the PDF file

**Returns:** `number` - Number of pages in the document

**Throws:** Error if file doesn't exist or isn't a valid PDF

**Example:**

```javascript
import { getPageCount } from "solopdf-cli";

try {
  const pages = getPageCount("/path/to/document.pdf");
  console.log(`Document has ${pages} pages`);
} catch (error) {
  console.error("Error:", error.message);
}
```

---

### `getPdfInfoBeforeSigning(filePath: string): number`

Get PDF information before processing. Currently returns page count.

**Parameters:**

- `filePath` (string): Absolute path to the PDF file

**Returns:** `number` - Number of pages in the document

**Example:**

```javascript
import { getPdfInfoBeforeSigning } from "solopdf-cli";

const info = getPdfInfoBeforeSigning("/path/to/document.pdf");
console.log(`PDF analysis: ${info} pages`);
```

---

### `getPdfChecksum(filePath: string): string`

Generate SHA-256 checksum for file integrity verification.

**Parameters:**

- `filePath` (string): Absolute path to the PDF file

**Returns:** `string` - SHA-256 checksum in hexadecimal format

**Example:**

```javascript
import { getPdfChecksum } from "solopdf-cli";

const checksum = getPdfChecksum("/path/to/document.pdf");
console.log(`SHA-256: ${checksum}`);
// Output: SHA-256: a1b2c3d4e5f6789abcdef...
```

## ✍️ PDF Watermarking Functions

### `signPdfWithOptions(filePath: string, text: string, options?: SigningOptions): void`

Add a watermark to a PDF with advanced options.

**Parameters:**

- `filePath` (string): Path to the PDF file to modify (will be modified in-place)
- `text` (string): Watermark text to add
- `options` (SigningOptions, optional): Watermark options

**Returns:** `void`

**SigningOptions Interface:**

```typescript
interface SigningOptions {
  fontSize?: number; // Font size in points (default: 12)
  color?: string; // Text color (default: "black")
  xPosition?: number; // X coordinate in points
  yPosition?: number; // Y coordinate in points
  pages?: number[]; // Array of page numbers to watermark
  position?: string; // Predefined position
  rotation?: number; // Rotation angle in degrees (default: 0)
  opacity?: number; // Opacity from 0.0 to 1.0 (default: 1.0)
}
```

**Position Values:**

- `"top-left"`, `"top-center"`, `"top-right"`
- `"center-left"`, `"center"`, `"center-right"`
- `"bottom-left"`, `"bottom-center"`, `"bottom-right"`

**Example:**

```javascript
import { signPdfWithOptions } from "solopdf-cli";

// Basic watermark
signPdfWithOptions("/path/to/document.pdf", "CONFIDENTIAL");

// Advanced watermark
const options = {
  fontSize: 18,
  color: "red",
  pages: [1, 3, 5],
  position: "center",
  rotation: 45,
  opacity: 0.5,
};

signPdfWithOptions("/path/to/document.pdf", "DRAFT", options);
```

## 🔐 Digital Signature Functions

### `generateSigningKeyPair(): string`

Generate a new RSA-2048 key pair for digital signatures.

**Returns:** `string` - JSON string containing the key pair

**Key Pair Structure:**

```typescript
interface KeyPair {
  private_key: string; // PEM-encoded private key
  public_key: string; // PEM-encoded public key
  fingerprint: string; // SHA-256 fingerprint
  created_at: string; // ISO 8601 timestamp
}
```

**Example:**

```javascript
import { generateSigningKeyPair } from "solopdf-cli";

const keyPairJson = generateSigningKeyPair();
const keyPair = JSON.parse(keyPairJson);

console.log("Fingerprint:", keyPair.fingerprint);
console.log("Created:", keyPair.created_at);

// Save to file
import fs from "fs";
fs.writeFileSync("signing-keys.json", keyPairJson);
```

---

### `getKeyInfoFromJson(keyPairJson: string): string`

Extract public key information from a key pair.

**Parameters:**

- `keyPairJson` (string): JSON string containing the key pair

**Returns:** `string` - JSON string with key information

**Key Info Structure:**

```typescript
interface KeyInfo {
  public_key: string; // PEM-encoded public key
  fingerprint: string; // SHA-256 fingerprint
  key_size: number; // Key size in bits
  algorithm: string; // "RSA"
}
```

**Example:**

```javascript
import { getKeyInfoFromJson } from "solopdf-cli";
import fs from "fs";

const keyPairJson = fs.readFileSync("signing-keys.json", "utf8");
const keyInfoJson = getKeyInfoFromJson(keyPairJson);
const keyInfo = JSON.parse(keyInfoJson);

console.log(`${keyInfo.algorithm}-${keyInfo.key_size} key`);
console.log(`Fingerprint: ${keyInfo.fingerprint}`);
```

---

### `signPdfWithKey(inputPath: string, outputPath: string, privateKey: string, signatureText?: string): string`

Digitally sign a PDF using RSA cryptographic signature.

**Parameters:**

- `inputPath` (string): Path to input PDF file
- `outputPath` (string): Path for signed PDF output
- `privateKey` (string): Base64-encoded private key from key pair
- `signatureText` (string, optional): Visible signature text

**Returns:** `string` - JSON string with signature information

**Signature Result Structure:**

```typescript
interface SignedDocument {
  success: boolean;
  signature_info: {
    algorithm: string; // "RSA-SHA256"
    timestamp: string; // ISO 8601 timestamp
    hash: string; // Document hash
    signature: string; // Cryptographic signature
  };
  file_info: {
    input_path: string;
    output_path: string;
    file_size: number;
  };
}
```

**Example:**

```javascript
import { signPdfWithKey } from "solopdf-cli";
import fs from "fs";

// Load key pair
const keyPair = JSON.parse(fs.readFileSync("signing-keys.json", "utf8"));

// Sign PDF
const result = signPdfWithKey(
  "/path/to/input.pdf",
  "/path/to/signed.pdf",
  keyPair.private_key,
  "Signed by John Doe"
);

const signedDoc = JSON.parse(result);
console.log("Signature created:", signedDoc.signature_info.timestamp);

// Save signature info for verification
fs.writeFileSync(
  "signature.json",
  JSON.stringify(signedDoc.signature_info, null, 2)
);
```

---

### `verifyPdfSignature(filePath: string, signatureInfo: string, publicKey: string): string`

Verify a digital signature on a PDF document.

**Parameters:**

- `filePath` (string): Path to signed PDF file
- `signatureInfo` (string): JSON signature information from signing
- `publicKey` (string): Base64-encoded public key

**Returns:** `string` - JSON verification result

**Verification Result Structure:**

```typescript
interface VerificationResult {
  is_valid: boolean;
  message: string;
  verified_at: string; // ISO 8601 timestamp
  signature_info?: {
    algorithm: string;
    timestamp: string;
    hash: string;
  };
}
```

**Example:**

```javascript
import { verifyPdfSignature } from "solopdf-cli";
import fs from "fs";

// Load signature info and keys
const signatureInfo = fs.readFileSync("signature.json", "utf8");
const keyPair = JSON.parse(fs.readFileSync("signing-keys.json", "utf8"));

// Verify signature
const result = verifyPdfSignature(
  "/path/to/signed.pdf",
  signatureInfo,
  keyPair.public_key
);

const verification = JSON.parse(result);

if (verification.is_valid) {
  console.log("✅ Signature is VALID");
  console.log("Verified at:", verification.verified_at);
} else {
  console.log("❌ Signature is INVALID");
  console.log("Reason:", verification.message);
}
```

## 🛠️ TypeScript Definitions

Full TypeScript definitions are included in the package:

```typescript
// Import types
import type { SigningOptions } from "solopdf-cli";

// Function signatures
declare function getPageCount(filePath: string): number;
declare function signPdfWithOptions(
  filePath: string,
  text: string,
  options?: SigningOptions
): void;
declare function getPdfInfoBeforeSigning(filePath: string): number;
declare function generateSigningKeyPair(): string;
declare function getKeyInfoFromJson(keyPairJson: string): string;
declare function signPdfWithKey(
  inputPath: string,
  outputPath: string,
  privateKey: string,
  signatureText?: string
): string;
declare function verifyPdfSignature(
  filePath: string,
  signatureInfo: string,
  publicKey: string
): string;
declare function getPdfChecksum(filePath: string): string;

interface SigningOptions {
  fontSize?: number;
  color?: string;
  xPosition?: number;
  yPosition?: number;
  pages?: number[];
  position?: string;
  rotation?: number;
  opacity?: number;
}
```

## 🎯 Usage Patterns

### Error Handling

```javascript
import { getPageCount, signPdfWithOptions } from "solopdf-cli";

// Wrap in try-catch for error handling
function safeGetPageCount(filePath) {
  try {
    return getPageCount(filePath);
  } catch (error) {
    if (error.message.includes("No such file")) {
      console.error("File not found:", filePath);
    } else if (error.message.includes("Invalid PDF")) {
      console.error("Invalid PDF file:", filePath);
    } else {
      console.error("Unexpected error:", error.message);
    }
    return null;
  }
}
```

### Async Wrapper

```javascript
import { promisify } from "util";
import { getPageCount } from "solopdf-cli";

// Create async version for better integration
const getPageCountAsync = promisify((filePath, callback) => {
  try {
    const result = getPageCount(filePath);
    callback(null, result);
  } catch (error) {
    callback(error);
  }
});

// Usage
async function analyzeDocument(filePath) {
  try {
    const pages = await getPageCountAsync(filePath);
    console.log(`Document has ${pages} pages`);
    return pages;
  } catch (error) {
    console.error("Analysis failed:", error.message);
    throw error;
  }
}
```

### Batch Processing

```javascript
import { getPageCount, signPdfWithOptions } from "solopdf-cli";
import fs from "fs";
import path from "path";

async function batchWatermark(directory, watermarkText, options = {}) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => path.extname(file).toLowerCase() === ".pdf")
    .map((file) => path.join(directory, file));

  const results = [];

  for (const filePath of files) {
    try {
      const pages = getPageCount(filePath);

      // Create backup
      const backupPath = filePath.replace(".pdf", ".backup.pdf");
      fs.copyFileSync(filePath, backupPath);

      // Apply watermark
      signPdfWithOptions(filePath, watermarkText, options);

      results.push({
        file: filePath,
        pages: pages,
        status: "success",
      });

      console.log(`✅ Processed: ${path.basename(filePath)} (${pages} pages)`);
    } catch (error) {
      results.push({
        file: filePath,
        error: error.message,
        status: "error",
      });

      console.log(`❌ Failed: ${path.basename(filePath)} - ${error.message}`);
    }
  }

  return results;
}

// Usage
const results = await batchWatermark("./documents", "CONFIDENTIAL", {
  fontSize: 16,
  position: "center",
  opacity: 0.3,
});

console.log(
  `Processed ${
    results.filter((r) => r.status === "success").length
  } files successfully`
);
```

### Configuration Management

```javascript
import fs from "fs";
import path from "path";

class SoloPDFConfig {
  constructor(configPath = "./solopdf.config.json") {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      }
    } catch (error) {
      console.warn("Failed to load config, using defaults");
    }

    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      watermark: {
        fontSize: 12,
        color: "black",
        position: "bottom-right",
        opacity: 1.0,
        rotation: 0,
      },
      signature: {
        keyPath: "./signing-keys.json",
        defaultText: "Digitally Signed",
      },
      output: {
        backupOriginals: true,
        outputSuffix: "_processed",
      },
    };
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  getWatermarkOptions() {
    return { ...this.config.watermark };
  }

  setWatermarkDefaults(options) {
    this.config.watermark = { ...this.config.watermark, ...options };
    this.saveConfig();
  }
}

// Usage
const config = new SoloPDFConfig();

// Apply watermark with config defaults
signPdfWithOptions(
  "/path/to/document.pdf",
  "CONFIDENTIAL",
  config.getWatermarkOptions()
);
```

## ⚡ Performance Tips

### Memory Management

```javascript
// Process large batches in chunks to avoid memory issues
async function processLargeDirectory(directory, chunkSize = 10) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => path.extname(file).toLowerCase() === ".pdf");

  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);

    // Process chunk
    await Promise.all(
      chunk.map(async (file) => {
        const filePath = path.join(directory, file);
        const pages = getPageCount(filePath);
        return { file, pages };
      })
    );

    // Allow garbage collection between chunks
    if (global.gc) {
      global.gc();
    }
  }
}
```

### Caching Results

```javascript
class PDFCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getPageCount(filePath) {
    const key = `${filePath}:${fs.statSync(filePath).mtime}`;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const pages = getPageCount(filePath);

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, pages);
    return pages;
  }
}

const cache = new PDFCache();

// Use cached version
const pages = cache.getPageCount("/path/to/document.pdf");
```

## 🔍 Error Reference

Common errors and their solutions:

| Error Message                   | Cause                              | Solution                                                  |
| ------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `No such file or directory`     | File path is incorrect             | Verify file exists and path is correct                    |
| `Invalid PDF format`            | File is not a valid PDF            | Check file integrity with `getPdfChecksum()`              |
| `Permission denied`             | Insufficient file permissions      | Check file permissions or run with appropriate privileges |
| `Key generation failed`         | Cryptographic error                | Retry operation, check system entropy                     |
| `Signature verification failed` | Invalid signature or tampered file | Check signature info and public key match                 |
| `Page number out of range`      | Invalid page selection in options  | Verify page numbers are within document range             |

---

**Need help?** Check our [troubleshooting guide](INSTALL.md#troubleshooting) or [create an issue](https://github.com/soloflow-ai/solopdf-cli/issues).
