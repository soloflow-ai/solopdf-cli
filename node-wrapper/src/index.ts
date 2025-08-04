#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import {
  getPageCount,
  signPdf,
  getPdfInfoBeforeSigning,
} from '../../rust-core/index.js';
const program = new Command();

program
  .name('SoloPDF')
  .description('A blazingly fast PDF utility powered by Rust.')
  .version('0.1.0');

program
  .command('pages')
  .description('Get the number of pages in a PDF file.')
  .argument('<file>', 'The path to the PDF file')
  .action((file: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(`Analyzing: ${absolutePath}`);

      // Call the ultra-fast Rust function!
      const count = getPageCount(absolutePath);

      console.log(`✅ Success! Page count: ${count}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`❌ Error: ${err.message}`);
      } else {
        console.error(`❌ Error: ${String(err)}`);
      }
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Get information about a PDF file before signing.')
  .argument('<file>', 'The path to the PDF file')
  .action((file: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(`Getting PDF info: ${absolutePath}`);

      // Get PDF information using the Rust function
      const pageCount = getPdfInfoBeforeSigning(absolutePath);

      console.log(`✅ Success! PDF Information:`);
      console.log(`   📄 Pages: ${pageCount}`);
      console.log(`   📁 File: ${absolutePath}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`❌ Error: ${err.message}`);
      } else {
        console.error(`❌ Error: ${String(err)}`);
      }
      process.exit(1);
    }
  });

program
  .command('sign')
  .description('Sign a PDF file with a signature text.')
  .argument('<file>', 'The path to the PDF file to sign')
  .argument('<signature>', 'The signature text to add')
  .action((file: string, signature: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(`Signing PDF: ${absolutePath}`);
      console.log(`Signature text: "${signature}"`);

      // First, get info about the PDF
      const pageCount = getPdfInfoBeforeSigning(absolutePath);
      console.log(`📄 Document has ${pageCount} pages`);

      // Sign the PDF using the Rust function
      signPdf(absolutePath, signature);

      console.log(`✅ Success! PDF signed with signature: "${signature}"`);
      console.log(`📁 File: ${absolutePath}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`❌ Error: ${err.message}`);
      } else {
        console.error(`❌ Error: ${String(err)}`);
      }
      process.exit(1);
    }
  });

program.parse();
