import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  try {
    // Try to load from platform-specific optional dependency
    const packageName = `solopdf-cli-${platformName}`;
    const require = createRequire(import.meta.url);
    return require(packageName);
  } catch (firstError) {
    try {
      // Fallback: try to load from local rust-core directory
      const localPath = path.join(__dirname, 'rust-core', 'index.node');
      if (fs.existsSync(localPath)) {
        const require = createRequire(import.meta.url);
        return require(localPath);
      }
    } catch (secondError) {
      // Final fallback: try the built-in copy
      try {
        const require = createRequire(import.meta.url);
        return require('./rust-core/index.js');
      } catch (thirdError) {
        const getErrorMessage = (error: unknown): string =>
          error instanceof Error ? error.message : String(error);

        throw new Error(
          `Failed to load native binary for ${platformName}. ` +
            `This package might not support your platform yet. ` +
            `Original errors: ${getErrorMessage(firstError)}, ${getErrorMessage(secondError)}, ${getErrorMessage(thirdError)}`,
        );
      }
    }
  }
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
