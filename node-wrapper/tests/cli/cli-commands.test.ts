import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { isBinaryAvailable } from '../test-helpers/binary-check';

// Global fail function for Jest
declare global {
  function fail(message?: string): never;
}

// Use current working directory to build test paths
const testDir = path.resolve('./tests/cli');

const describeWithBinary = isBinaryAvailable() ? describe : describe.skip;

describeWithBinary('CLI Commands', () => {
  const cliPath = path.join(testDir, '../../dist/index.js');
  const samplePdfsDir = path.join(testDir, '../../../sample-pdfs');
  let samplePdfs: string[] = [];
  const tempFiles: string[] = [];

  beforeAll(() => {
    // Ensure CLI is built
    if (!fs.existsSync(cliPath)) {
      execSync('npm run build', { cwd: path.join(testDir, '../..') });
    }

    // Get sample PDFs
    if (fs.existsSync(samplePdfsDir)) {
      samplePdfs = fs
        .readdirSync(samplePdfsDir)
        .filter((file) => file.endsWith('.pdf'))
        .map((file) => path.join(samplePdfsDir, file));
    }
  });

  afterEach(() => {
    // Clean up temp files
    tempFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    tempFiles.length = 0;
  });

  describe('Help Commands', () => {
    it('should display main help', () => {
      const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });
      expect(output).toContain('SoloPDF');
      expect(output).toContain('pages');
      expect(output).toContain('info');
      expect(output).toContain('sign');
    });

    it('should display version', () => {
      const output = execSync(`node ${cliPath} --version`, {
        encoding: 'utf8',
      });
      expect(output.trim()).toMatch(/\d+/); // Should contain version number
    });

    it('should display pages command help', () => {
      const output = execSync(`node ${cliPath} pages --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Get the number of pages');
      expect(output).toContain('<file>');
    });

    it('should display info command help', () => {
      const output = execSync(`node ${cliPath} info --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Get information about a PDF');
      expect(output).toContain('<file>');
    });

    it('should display watermark command help', () => {
      const output = execSync(`node ${cliPath} watermark --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('watermark');
      expect(output).toContain('<file>');
      expect(output).toContain('<text>');
    });
  });

  describe('Pages Command', () => {
    it('should get page count for sample PDFs', () => {
      samplePdfs.forEach((pdfPath) => {
        if (fs.existsSync(pdfPath)) {
          const output = execSync(`node ${cliPath} pages "${pdfPath}"`, {
            encoding: 'utf8',
          });
          expect(output).toContain('Success');
          expect(output).toContain('Page count:');
          expect(output).toMatch(/Page count:\s*\d+/);
        }
      });
    });

    it('should handle non-existent file gracefully', () => {
      try {
        execSync(`node ${cliPath} pages "/non/existent/file.pdf"`, {
          encoding: 'utf8',
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as {
          status: number;
          stderr?: Buffer;
          stdout?: Buffer;
          message?: string;
        };
        expect(execError.status).not.toBe(0);
        const errorOutput =
          execError.stderr?.toString() ||
          execError.stdout?.toString() ||
          execError.message ||
          '';
        expect(errorOutput).toMatch(/Error|No such file|not found/i);
      }
    });

    it('should handle invalid PDF file gracefully', () => {
      const tempFile = path.join(testDir, 'temp-invalid-cli.pdf');
      tempFiles.push(tempFile);
      fs.writeFileSync(tempFile, 'This is not a PDF file');

      try {
        execSync(`node ${cliPath} pages "${tempFile}"`, { encoding: 'utf8' });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });

    it('should handle file paths with spaces', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp file with spaces.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(`node ${cliPath} pages "${tempPath}"`, {
          encoding: 'utf8',
        });
        expect(output).toContain('Success');
        expect(output).toContain('Page count:');
      }
    });
  });

  describe('Info Command', () => {
    it('should get PDF info for sample PDFs', () => {
      samplePdfs.slice(0, 3).forEach((pdfPath) => {
        if (fs.existsSync(pdfPath)) {
          const output = execSync(`node ${cliPath} info "${pdfPath}"`, {
            encoding: 'utf8',
          });
          expect(output).toContain('Success');
          expect(output).toContain('PDF Information');
          expect(output).toContain('Pages:');
          expect(output).toContain('File:');
          expect(output).toMatch(/Pages:\s*\d+/);
        }
      });
    });

    it('should handle non-existent file gracefully', () => {
      try {
        execSync(`node ${cliPath} info "/non/existent/file.pdf"`, {
          encoding: 'utf8',
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });
  });

  describe('Watermark Command', () => {
    it('should watermark PDF files successfully', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-watermark.pdf');
        const outputPath = path.join(testDir, 'temp-cli-watermark-output.pdf');
        tempFiles.push(tempPath);
        tempFiles.push(outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const watermark = 'CLI Test Watermark';
        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "${watermark}" "${outputPath}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('watermarked');
        expect(output).toContain(watermark);
        expect(output).toContain('Document has');
        expect(output).toContain('pages');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle watermark with special characters', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-special.pdf');
        const outputPath = path.join(testDir, 'temp-cli-special-output.pdf');
        tempFiles.push(tempPath);
        tempFiles.push(outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const watermark = 'John Döe - Spëcial Watermark 🖊️';
        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "${watermark}" "${outputPath}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('watermarked');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle empty watermark', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-empty.pdf');
        const outputPath = path.join(testDir, 'temp-cli-empty-output.pdf');
        tempFiles.push(tempPath);
        tempFiles.push(outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "" "${outputPath}"`,
          {
            encoding: 'utf8',
          },
        );

        expect(output).toContain('Success');
        expect(output).toContain('watermarked');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle long watermarks', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-long.pdf');
        const outputPath = path.join(testDir, 'temp-cli-long-output.pdf');
        tempFiles.push(tempPath);
        tempFiles.push(outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const longWatermark = 'Very long watermark: ' + 'A'.repeat(100);
        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "${longWatermark}" "${outputPath}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('watermarked');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle non-existent file gracefully', () => {
      const outputPath = path.join(testDir, 'watermarked-nonexistent.pdf');
      tempFiles.push(outputPath);
      try {
        execSync(
          `node ${cliPath} watermark "/non/existent/file.pdf" "Watermark" "${outputPath}"`,
          {
            encoding: 'utf8',
          },
        );
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });

    it('should display page count before watermarking', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-info.pdf');
        const outputPath = path.join(testDir, 'temp-cli-info-output.pdf');
        tempFiles.push(tempPath);
        tempFiles.push(outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "Test" "${outputPath}"`,
          {
            encoding: 'utf8',
          },
        );

        expect(output).toContain('Document has');
        expect(fs.existsSync(outputPath)).toBe(true);
        expect(output).toContain('pages');
        expect(output).toMatch(/Document has\s+\d+\s+pages/);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle workflow: info -> watermark -> pages', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-workflow.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        // Get info
        const infoOutput = execSync(`node ${cliPath} info "${tempPath}"`, {
          encoding: 'utf8',
        });
        const pageMatch = infoOutput.match(/Pages:\s*(\d+)/);
        expect(pageMatch).toBeTruthy();
        const originalPages = parseInt(pageMatch![1]);

        // Watermark
        const outputPath = path.join(testDir, 'temp-cli-workflow-output.pdf');
        tempFiles.push(outputPath);
        const watermarkOutput = execSync(
          `node ${cliPath} watermark "${tempPath}" "Workflow Test" "${outputPath}"`,
          { encoding: 'utf8' },
        );
        expect(watermarkOutput).toContain('Success');
        expect(fs.existsSync(outputPath)).toBe(true);

        // Check pages again (on the watermarked output file)
        const pagesOutput = execSync(`node ${cliPath} pages "${outputPath}"`, {
          encoding: 'utf8',
        });
        const finalPageMatch = pagesOutput.match(/Page count:\s*(\d+)/);
        expect(finalPageMatch).toBeTruthy();
        const finalPages = parseInt(finalPageMatch![1]);

        expect(finalPages).toBe(originalPages);
      }
    });

    it('should handle multiple watermarks on same file', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-cli-multi.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        // First watermark
        const output1Path = path.join(testDir, 'temp-cli-multi-1.pdf');
        tempFiles.push(output1Path);
        const output1 = execSync(
          `node ${cliPath} watermark "${tempPath}" "First Watermark" "${output1Path}"`,
          { encoding: 'utf8' },
        );
        expect(output1).toContain('Success');
        expect(fs.existsSync(output1Path)).toBe(true);

        // Second watermark (using first output as input)
        const output2Path = path.join(testDir, 'temp-cli-multi-2.pdf');
        tempFiles.push(output2Path);
        const output2 = execSync(
          `node ${cliPath} watermark "${output1Path}" "Second Watermark" "${output2Path}"`,
          { encoding: 'utf8' },
        );
        expect(output2).toContain('Success');
        expect(fs.existsSync(output2Path)).toBe(true);

        // Verify final file still works
        const pagesOutput = execSync(`node ${cliPath} pages "${output2Path}"`, {
          encoding: 'utf8',
        });
        expect(pagesOutput).toContain('Success');
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error for missing arguments', () => {
      try {
        execSync(`node ${cliPath} pages`, { encoding: 'utf8' });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }

      try {
        execSync(`node ${cliPath} sign "file.pdf"`, { encoding: 'utf8' });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });

    it('should display error for unknown commands', () => {
      try {
        execSync(`node ${cliPath} unknown-command`, { encoding: 'utf8' });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });
  });
});
