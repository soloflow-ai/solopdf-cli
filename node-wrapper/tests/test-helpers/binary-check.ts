/**
 * Helper to check if native binary is available for testing
 */

import { execSync } from 'child_process';
import path from 'path';

export function isBinaryAvailable(): boolean {
  try {
    const cliPath = path.join(__dirname, '../../dist/index.js');
    // Try to run the CLI with --version to see if binary loads
    const result = execSync(`node "${cliPath}" --version`, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.includes('1.') || result.includes('solopdf'); // Check for version output
  } catch (error) {
    console.log('Binary availability check failed:', error);
    return false;
  }
}

export function skipIfNoBinary() {
  return isBinaryAvailable()
    ? false
    : 'Native binary not available in this environment';
}

export function runCliCommand(command: string): string {
  const cliPath = path.join(__dirname, '../../dist/index.js');
  return execSync(`node "${cliPath}" ${command}`, {
    encoding: 'utf8',
    timeout: 10000,
  });
}
