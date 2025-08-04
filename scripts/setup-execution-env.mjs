#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current timestamp
const timestamp = new Date()
  .toISOString()
  .replace(/:/g, "-")
  .replace(/\./g, "-")
  .replace("T", "_")
  .substring(0, 19); // Format: YYYY-MM-DD_HH-MM-SS

const rootDir = path.resolve(__dirname, "..");
const executedDir = path.join(rootDir, "executed");
const currentExecutedDir = path.join(executedDir, `executed_${timestamp}`);

async function main() {
  try {
    // Ensure executed directory exists
    if (!fs.existsSync(executedDir)) {
      fs.mkdirSync(executedDir, { recursive: true });
    }

    // Create current execution directory
    fs.mkdirSync(currentExecutedDir, { recursive: true });

    // Create subdirectories
    const subDirs = ["sample-pdfs", "generated-pdfs", "test-results", "temp"];
    subDirs.forEach((subDir) => {
      fs.mkdirSync(path.join(currentExecutedDir, subDir), { recursive: true });
    });

    // Generate test PDFs
    console.log("🔧 Generating test PDFs...");
    await generateTestPDFs(path.join(currentExecutedDir, "generated-pdfs"));

    // Copy sample PDFs for testing
    const samplePdfsSource = path.join(rootDir, "sample-pdfs");
    const samplePdfsTarget = path.join(currentExecutedDir, "sample-pdfs");

    if (fs.existsSync(samplePdfsSource)) {
      console.log("📄 Copying sample PDFs...");
      copyDirectory(samplePdfsSource, samplePdfsTarget);
    }

    // Clean up old execution directories (keep only last 3)
    console.log("🧹 Cleaning up old execution directories...");
    cleanupOldDirectories(executedDir);

    console.log(`✅ Execution environment ready: ${currentExecutedDir}`);
    console.log(`📊 You can run tests with the PDFs in this directory`);

    // Set environment variable for tests
    process.env.SOLOPDF_TEST_DIR = currentExecutedDir;

    return currentExecutedDir;
  } catch (error) {
    console.error("❌ Error setting up execution environment:", error);
    process.exit(1);
  }
}

async function generateTestPDFs(outputDir) {
  // Use the Rust binary to generate test PDFs
  const { execSync } = await import("child_process");
  const rustCoreDir = path.join(path.dirname(__dirname), "rust-core");

  try {
    // Build the PDF generator if it doesn't exist
    execSync("cargo build --bin generate_test_pdfs", {
      cwd: rustCoreDir,
      stdio: "inherit",
    });

    // Run the PDF generator
    execSync(`cargo run --bin generate_test_pdfs -- "${outputDir}"`, {
      cwd: rustCoreDir,
      stdio: "inherit",
    });
  } catch (error) {
    console.warn(
      "⚠️  Could not generate test PDFs with Rust, creating simple ones instead"
    );
    createFallbackPDFs(outputDir);
  }
}

function createFallbackPDFs(outputDir) {
  // Create simple text files as fallback (for testing purposes)
  const fallbackFiles = [
    {
      name: "simple-test.txt",
      content: "Simple test file for fallback testing",
    },
    {
      name: "test-info.json",
      content: JSON.stringify(
        {
          created: new Date().toISOString(),
          type: "fallback",
          message: "Rust PDF generation not available",
        },
        null,
        2
      ),
    },
  ];

  fallbackFiles.forEach((file) => {
    fs.writeFileSync(path.join(outputDir, file.name), file.content);
  });
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) return;

  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function cleanupOldDirectories(executedDir) {
  if (!fs.existsSync(executedDir)) return;

  const entries = fs
    .readdirSync(executedDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith("executed_")
    )
    .map((entry) => ({
      name: entry.name,
      path: path.join(executedDir, entry.name),
      mtime: fs.statSync(path.join(executedDir, entry.name)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Sort by modification time, newest first

  // Keep only the 3 most recent directories
  const toDelete = entries.slice(3);

  toDelete.forEach((entry) => {
    console.log(`🗑️  Removing old directory: ${entry.name}`);
    fs.rmSync(entry.path, { recursive: true, force: true });
  });

  if (toDelete.length > 0) {
    console.log(`✅ Cleaned up ${toDelete.length} old execution directories`);
  }
}

// Export for use in other scripts
export { main as setupExecutionEnvironment };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((dir) => {
    console.log(`\n🎯 Execution directory: ${dir}`);
    console.log("🧪 Run tests with: npm test");
    console.log(
      "🔬 Run specific tests with: npm test -- --testPathPattern=unit"
    );
  });
}
