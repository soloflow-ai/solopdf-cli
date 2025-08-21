import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getPlatform(): string {
  const { platform, arch } = process;

  switch (platform) {
    case 'win32':
      return arch === 'x64' ? 'win32-x64-msvc' : `win32-${arch}`;
    case 'darwin':
      return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
    case 'linux':
      return arch === 'x64' ? 'linux-x64-gnu' : `linux-${arch}`;
    default:
      throw new Error(`Unsupported platform: ${platform}-${arch}`);
  }
}

function tryLoadPlatformBinary() {
  const platformName = getPlatform();
  const errors: string[] = [];

  // Strategy 1: Try to load from platform-specific optional dependency
  try {
    const packageName = `solopdf-cli-${platformName}`;
    const require = createRequire(import.meta.url);
    const platformModule = require(packageName);
    return platformModule;
  } catch (firstError) {
    errors.push(
      `Platform package 'solopdf-cli-${platformName}': ${getErrorMessage(firstError)}`,
    );
  }

  // Strategy 2: Try to load platform-specific binary from local rust-core directory
  try {
    const require = createRequire(import.meta.url);
    const platformSpecificPath = path.join(
      __dirname,
      'rust-core',
      `index.${platformName}.node`,
    );

    if (fs.existsSync(platformSpecificPath)) {
      const testModule = require(platformSpecificPath);
      if (testModule && typeof testModule.getPageCount === 'function') {
        return testModule;
      }
    }
  } catch (platformError) {
    errors.push(
      `Platform-specific binary load failed: ${getErrorMessage(platformError)}`,
    );
  }

  // Strategy 3: Try to load from generic local rust-core directory (development/local build)
  try {
    const localPath = path.join(__dirname, 'rust-core', 'index.node');
    if (fs.existsSync(localPath)) {
      const require = createRequire(import.meta.url);
      // Test if the binary is compatible with current platform
      const testModule = require(localPath);
      if (testModule && typeof testModule.getPageCount === 'function') {
        return testModule;
      }
    } else {
      errors.push(`Generic binary not found at: ${localPath}`);
    }
  } catch (secondError) {
    errors.push(`Generic binary load failed: ${getErrorMessage(secondError)}`);
  }

  // Strategy 4: Try the JavaScript wrapper (fallback) - but use dynamic import for ES modules
  try {
    const jsWrapperPath = path.join(__dirname, 'rust-core', 'index.js');
    if (fs.existsSync(jsWrapperPath)) {
      // Use dynamic import instead of require for ES modules
      const require = createRequire(import.meta.url);
      const jsModule = require(jsWrapperPath);
      if (jsModule && typeof jsModule.getPageCount === 'function') {
        return jsModule;
      }
    }
  } catch (thirdError) {
    errors.push(`JavaScript wrapper failed: ${getErrorMessage(thirdError)}`);
  }

  // All strategies failed
  const errorDetails = errors.join('; ');

  throw new Error(
    `Failed to load native binary for ${platformName}.\n\n` +
      `This platform might not be supported yet. To resolve this:\n` +
      `1. Check if 'solopdf-cli-${platformName}' package exists on NPM\n` +
      `2. If missing, this platform package hasn't been published yet\n` +
      `3. Try installing from GitHub Actions artifacts or building locally\n` +
      `4. Report this issue at: https://github.com/soloflow-ai/solopdf-cli/issues\n\n` +
      `Platform: ${process.platform}-${process.arch}\n` +
      `Node.js: ${process.version}\n` +
      `Detailed errors: ${errorDetails}`,
  );
}

// Load the native module
const nativeModule = tryLoadPlatformBinary();

// Re-export all functions from the native module
export const {
  getPageCount,
  signPdfWithOptions,
  getPdfInfoBeforeSigning,
  getPdfChecksum,
  generateSigningKeyPair,
  getKeyInfoFromJson,
  signPdfWithKey,
  verifyPdfSignature,
} = nativeModule;

// Export types if they exist
export type SigningOptions = {
  fontSize?: number;
  color?: string;
  xPosition?: number;
  yPosition?: number;
  pages?: number[];
  position?: string;
  rotation?: number;
  opacity?: number;
};
