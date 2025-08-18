import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testDir = path.resolve('./tests/cli');

describe('Watermark Page Options', () => {
  const cliPath = path.join(testDir, '../../dist/index.js');
  const samplePdfsDir = path.join(testDir, '../../../executed/sample-pdfs');
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

  describe('Page Selection Options', () => {
    it('should watermark all pages by default', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-all-pages.pdf');
        const outputPath = path.join(testDir, 'temp-all-pages-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "ALL PAGES" "${outputPath}"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('all pages');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should watermark even pages only', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-even-pages.pdf');
        const outputPath = path.join(testDir, 'temp-even-pages-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "EVEN PAGES" "${outputPath}" --pages even`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('even pages');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should watermark odd pages only', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-odd-pages.pdf');
        const outputPath = path.join(testDir, 'temp-odd-pages-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "ODD PAGES" "${outputPath}" --pages odd`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('odd pages');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should watermark specific pages', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-specific-pages.pdf');
        const outputPath = path.join(testDir, 'temp-specific-pages-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "SPECIFIC PAGES" "${outputPath}" --pages "1,3"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('pages 1, 3');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle single page selection', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('single-page.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-single-page.pdf');
        const outputPath = path.join(testDir, 'temp-single-page-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "SINGLE PAGE" "${outputPath}" --pages "1"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('page 1');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should ignore invalid page numbers', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-invalid-pages.pdf');
        const outputPath = path.join(testDir, 'temp-invalid-pages-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "VALID PAGES" "${outputPath}" --pages "1,99,3,0,-1"`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('pages 1, 3'); // Only valid pages
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });

    it('should handle whitespace in page list', () => {
      if (samplePdfs.length > 0) {
        const originalPath =
          samplePdfs.find((p) => p.includes('three-pages.pdf')) ||
          samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-whitespace-pages.pdf');
        const outputPath = path.join(
          testDir,
          'temp-whitespace-pages-output.pdf',
        );
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "WHITESPACE TEST" "${outputPath}" --pages " 1 , 2 , 3 "`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('pages 1, 2, 3');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });
  });

  describe('Double-hyphen Options', () => {
    it('should only accept double-hyphen options', () => {
      if (samplePdfs.length > 0) {
        const originalPath = samplePdfs[0];
        const tempPath = path.join(testDir, 'temp-double-hyphen.pdf');
        const outputPath = path.join(testDir, 'temp-double-hyphen-output.pdf');
        tempFiles.push(tempPath, outputPath);

        fs.copyFileSync(originalPath, tempPath);

        // Test that double-hyphen works
        const output = execSync(
          `node ${cliPath} watermark "${tempPath}" "DOUBLE HYPHEN" "${outputPath}" --font-size 14 --color red --opacity 0.7`,
          { encoding: 'utf8' },
        );

        expect(output).toContain('Success');
        expect(output).toContain('Font size: 14');
        expect(output).toContain('Color: red');
        expect(output).toContain('Opacity: 70%');
        expect(fs.existsSync(outputPath)).toBe(true);
      }
    });
  });
});
