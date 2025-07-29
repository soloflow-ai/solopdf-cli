#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .version('0.0.1')
  .description(
    'SoloPDF - The ultimate open-source tool for all your PDF needs.',
  );

program
  .command('merge')
  .description('Merge two or more PDF files into one.')
  .action(() => {
    console.log('Merge command called!');
    // Logic for merging PDFs will go here
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
