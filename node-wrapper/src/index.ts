#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { getPageCount } from '../../rust-core/index';
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
    }
  });

program.parse();
