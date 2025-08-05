#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import {
  getPageCount,
  signPdf,
  getPdfInfoBeforeSigning,
} from '../rust-core/index.js';
import ora from 'ora';

// Utility function for showing loading animation using ora
function showProgress<T>(message: string, operation: () => T): T {
  const spinner = ora({ text: chalk.blue(message), color: 'cyan' }).start();
  try {
    const result = operation();
    spinner.succeed(chalk.green('Done!'));
    return result;
  } catch (error) {
    spinner.fail(chalk.red('Failed!'));
    throw error;
  }
}
const program = new Command();

program
  .name('solopdf')
  .description('A CLI tool for PDF operations')
  .version('0.0.5-alpha');

// Show header only when help is requested or no command is given
if (
  process.argv.length === 2 ||
  process.argv.includes('--help') ||
  process.argv.includes('-h')
) {
  console.log(chalk.cyan.bold('\n📄 SoloPDF CLI'));
  console.log(chalk.gray('A blazingly fast PDF utility powered by Rust\n'));
}

program
  .command('pages')
  .description(chalk.yellow('Get the number of pages in a PDF file.'))
  .argument('<file>', 'The path to the PDF file')
  .action((file: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(chalk.blue('🔍 Analyzing:'), chalk.white(absolutePath));

      // Call the ultra-fast Rust function with progress!
      const count = showProgress('📊 Counting pages...', () =>
        getPageCount(absolutePath),
      );

      console.log(
        chalk.green('✅ Success!'),
        chalk.bold(`Page count: ${chalk.cyan(count)}`),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(chalk.red('❌ Error:'), chalk.white(err.message));
      } else {
        console.error(chalk.red('❌ Error:'), chalk.white(String(err)));
      }
      process.exit(1);
    }
  });

program
  .command('info')
  .description(chalk.yellow('Get information about a PDF file before signing.'))
  .argument('<file>', 'The path to the PDF file')
  .action((file: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(
        chalk.blue('ℹ️  Getting PDF info:'),
        chalk.white(absolutePath),
      );

      // Get PDF information using the Rust function with progress
      const pageCount = showProgress('📋 Analyzing PDF structure...', () =>
        getPdfInfoBeforeSigning(absolutePath),
      );

      console.log(chalk.green('✅ Success!'), chalk.bold('PDF Information:'));
      console.log(chalk.blue('   📄 Pages:'), chalk.cyan.bold(pageCount));
      console.log(chalk.blue('   📁 File:'), chalk.gray(absolutePath));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(chalk.red('❌ Error:'), chalk.white(err.message));
      } else {
        console.error(chalk.red('❌ Error:'), chalk.white(String(err)));
      }
      process.exit(1);
    }
  });

program
  .command('sign')
  .description(chalk.yellow('Sign a PDF file with a signature text.'))
  .argument('<file>', 'The path to the PDF file to sign')
  .argument('<signature>', 'The signature text to add')
  .action((file: string, signature: string) => {
    try {
      const absolutePath = path.resolve(file);
      console.log(chalk.blue('✍️  Signing PDF:'), chalk.white(absolutePath));
      console.log(
        chalk.blue('📝 Signature text:'),
        chalk.yellow(`"${signature}"`),
      );

      // First, get info about the PDF
      const pageCount = showProgress('📋 Analyzing PDF...', () =>
        getPdfInfoBeforeSigning(absolutePath),
      );
      console.log(
        chalk.magenta('📄 Document has'),
        chalk.cyan.bold(pageCount),
        chalk.magenta('pages'),
      );

      // Sign the PDF using the Rust function
      showProgress('✍️  Applying signature...', () =>
        signPdf(absolutePath, signature),
      );

      console.log(
        chalk.green('✅ Success!'),
        chalk.bold('PDF signed with signature:'),
        chalk.yellow(`"${signature}"`),
      );
      console.log(chalk.blue('📁 File:'), chalk.gray(absolutePath));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(chalk.red('❌ Error:'), chalk.white(err.message));
      } else {
        console.error(chalk.red('❌ Error:'), chalk.white(String(err)));
      }
      process.exit(1);
    }
  });

// Custom help formatting
program.configureHelp({
  formatHelp: (cmd, helper) => {
    const terminalWidth = process.stdout.columns || 80;
    const helpInfo = helper.formatHelp(cmd, helper);

    // Add some visual flair to the help output
    return (
      chalk.cyan('═'.repeat(terminalWidth)) +
      '\n' +
      chalk.cyan.bold('📄 SoloPDF CLI Help') +
      '\n' +
      chalk.gray('A blazingly fast PDF utility powered by Rust') +
      '\n' +
      chalk.cyan('═'.repeat(terminalWidth)) +
      '\n' +
      helpInfo
        .replace(/Usage:/g, chalk.yellow.bold('Usage:'))
        .replace(/Arguments:/g, chalk.green.bold('Arguments:'))
        .replace(/Options:/g, chalk.blue.bold('Options:'))
        .replace(/Commands:/g, chalk.magenta.bold('Commands:')) +
      '\n' +
      chalk.cyan('═'.repeat(terminalWidth)) +
      '\n' +
      chalk.gray('💡 Tip: Use --help with any command for more details\n')
    );
  },
});

// Add custom help styling
program.configureHelp({
  formatHelp: (cmd) => {
    let output = chalk.cyan.bold('\n📄 SoloPDF CLI\n');
    output += chalk.gray('A CLI tool for PDF operations\n\n');

    // Add usage
    output += chalk.yellow.bold('USAGE:\n');
    output += `  ${chalk.cyan('solopdf')} ${chalk.green('[command]')} ${chalk.gray('[options]')}\n\n`;

    // Add commands
    output += chalk.yellow.bold('COMMANDS:\n');
    cmd.commands.forEach((cmd) => {
      const name = cmd.name().padEnd(12);
      const desc = cmd.description() || '';
      output += `  ${chalk.cyan(name)} ${chalk.white(desc)}\n`;
    });

    output += '\n';
    output += chalk.yellow.bold('OPTIONS:\n');
    output += `  ${chalk.cyan('-h, --help'.padEnd(12))} ${chalk.white('Show help information')}\n`;
    output += `  ${chalk.cyan('-V, --version'.padEnd(12))} ${chalk.white('Show version number')}\n\n`;

    output +=
      chalk.gray('For more information on a command, use: ') +
      chalk.cyan('solopdf [command] --help') +
      '\n';

    return output;
  },
});

// Suppress the default help to avoid duplication
program.configureOutput({
  writeOut: (str) => process.stdout.write(str),
  writeErr: (str) => process.stderr.write(str),
});

program.parse();
