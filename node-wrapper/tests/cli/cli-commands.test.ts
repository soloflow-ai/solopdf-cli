import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('CLI Commands', () => {
  const cliPath = path.join(__dirname, '../../dist/index.js');
  const samplePdfsDir = path.join(__dirname, '../../../sample-pdfs');
  let samplePdfs: string[] = [];
  const tempFiles: string[] = [];

  beforeAll(() => {
    // Ensure CLI is built
    if (!fs.existsSync(cliPath)) {
      execSync('npm run build', { cwd: path.join(__dirname, '../..') });
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

    it('should display sign command help', () => {
      const output = execSync(`node ${cliPath} sign --help`, {
        encoding: 'utf8',
      });
      expect(output).toContain('Sign a PDF file');
      expect(output).toContain('<file>');
      expect(output).toContain('<signature>');
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
      const tempFile = path.join(__dirname, 'temp-invalid-cli.pdf');
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
        const tempPath = path.join(__dirname, 'temp file with spaces.pdf');
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

  describe('Sign Command', () => {
    it('should sign PDF files successfully', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-sign.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const signature = 'CLI Test Signature';
        const output = execSync(
          `node ${cliPath} sign "${tempPath}" "${signature}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('PDF signed');
        expect(output).toContain(signature);
        expect(output).toContain('Document has');
        expect(output).toContain('pages');
      }
    });

    it('should handle signature with special characters', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-special.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const signature = 'John Döe - Spëcial Signature 🖊️';
        const output = execSync(
          `node ${cliPath} sign "${tempPath}" "${signature}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('PDF signed');
      }
    });

    it('should handle empty signature', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-empty.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(`node ${cliPath} sign "${tempPath}" ""`, {
          encoding: 'utf8',
        });

        expect(output).toContain('Success');
        expect(output).toContain('PDF signed');
      }
    });

    it('should handle long signatures', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-long.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const longSignature = 'Very long signature: ' + 'A'.repeat(100);
        const output = execSync(
          `node ${cliPath} sign "${tempPath}" "${longSignature}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('PDF signed');
      }
    });

    it('should handle non-existent file gracefully', () => {
      try {
        execSync(`node ${cliPath} sign "/non/existent/file.pdf" "Signature"`, {
          encoding: 'utf8',
        });
        fail('Should have thrown an error');
      } catch (error: unknown) {
        const execError = error as { status: number };
        expect(execError.status).not.toBe(0);
      }
    });

    it('should display page count before signing', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-info.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(`node ${cliPath} sign "${tempPath}" "Test"`, {
          encoding: 'utf8',
        });

        expect(output).toContain('Document has');
        expect(output).toContain('pages');
        expect(output).toMatch(/Document has\s+\d+\s+pages/);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle workflow: info -> sign -> pages', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-workflow.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        // Get info
        const infoOutput = execSync(`node ${cliPath} info "${tempPath}"`, {
          encoding: 'utf8',
        });
        const pageMatch = infoOutput.match(/Pages:\s*(\d+)/);
        expect(pageMatch).toBeTruthy();
        const originalPages = parseInt(pageMatch![1]);

        // Sign
        const signOutput = execSync(
          `node ${cliPath} sign "${tempPath}" "Workflow Test"`,
          { encoding: 'utf8' },
        );
        expect(signOutput).toContain('Success');

        // Check pages again
        const pagesOutput = execSync(`node ${cliPath} pages "${tempPath}"`, {
          encoding: 'utf8',
        });
        const finalPageMatch = pagesOutput.match(/Page count:\s*(\d+)/);
        expect(finalPageMatch).toBeTruthy();
        const finalPages = parseInt(finalPageMatch![1]);

        expect(finalPages).toBe(originalPages);
      }
    });

    it('should handle multiple signatures on same file', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(__dirname, 'temp-cli-multi.pdf');
        tempFiles.push(tempPath);

        fs.copyFileSync(originalPath, tempPath);

        // First signature
        const output1 = execSync(
          `node ${cliPath} sign "${tempPath}" "First Signature"`,
          { encoding: 'utf8' },
        );
        expect(output1).toContain('Success');

        // Second signature
        const output2 = execSync(
          `node ${cliPath} sign "${tempPath}" "Second Signature"`,
          { encoding: 'utf8' },
        );
        expect(output2).toContain('Success');

        // Verify still works
        const pagesOutput = execSync(`node ${cliPath} pages "${tempPath}"`, {
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
