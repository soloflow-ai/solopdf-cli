#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
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
  .version('0.0.6-alpha');

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
  .description(
    chalk.yellow('Sign a PDF file with a signature text and options.'),
  )
  .argument('<file>', 'The path to the PDF file to sign')
  .argument('<signature>', 'The signature text to add')
  .argument('<output>', 'The output path for the signed PDF')
  .option(
    '-s, --font-size <size>',
    'Font size for the signature (visual only)',
    '12',
  )
  .option(
    '-c, --color <color>',
    'Color of the signature text (visual only)',
    'black',
  )
  .option(
    '-x, --x-position <x>',
    'X coordinate for signature placement (visual only)',
  )
  .option(
    '-y, --y-position <y>',
    'Y coordinate for signature placement (visual only)',
  )
  .option(
    '-p, --pages <pages>',
    'Pages to sign: comma-separated list (e.g., "1,3,5") or "all"',
    'all',
  )
  .option(
    '-P, --position <position>',
    'Predefined position (visual only)',
    'bottom-right',
  )
  .option(
    '-r, --rotation <degrees>',
    'Rotation angle in degrees (visual only)',
    '0',
  )
  .option(
    '-o, --opacity <opacity>',
    'Opacity level 0.0 to 1.0 (visual only)',
    '1.0',
  )
  .action(
    (
      file: string,
      signature: string,
      output: string,
      options: Record<string, string>,
    ) => {
      try {
        const absolutePath = path.resolve(file);
        const outputPath = path.resolve(output);

        console.log(chalk.blue('📄 Input PDF:'), chalk.white(absolutePath));
        console.log(chalk.blue('✍️  Output PDF:'), chalk.white(outputPath));
        console.log(
          chalk.blue('📝 Signature text:'),
          chalk.yellow(`"${signature}"`),
        );

        // Check if input file exists
        try {
          fs.accessSync(absolutePath);
        } catch {
          throw new Error(`Input file not found: ${absolutePath}`);
        }

        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        // Copy input file to output location
        console.log(chalk.cyan('📋 Creating copy...'));
        fs.copyFileSync(absolutePath, outputPath);

        // Display parsed options for user feedback
        console.log(chalk.cyan('\n📋 Signature Options:'));

        const fontSize = parseFloat(options.fontSize || '12');
        console.log(chalk.gray(`   📏 Font size: ${fontSize}`));

        if (options.color && options.color !== 'black') {
          console.log(chalk.gray(`   🎨 Color: ${options.color}`));
        }

        if (options.xPosition && options.yPosition) {
          const x = parseFloat(options.xPosition);
          const y = parseFloat(options.yPosition);
          if (!isNaN(x) && !isNaN(y)) {
            console.log(chalk.gray(`   📍 Position: (${x}, ${y})`));
          }
        }

        if (options.position && options.position !== 'bottom-right') {
          console.log(chalk.gray(`   📌 Position: ${options.position}`));
        }

        const rotation = parseFloat(options.rotation || '0');
        if (rotation !== 0) {
          console.log(chalk.gray(`   🔄 Rotation: ${rotation}°`));
        }

        const opacity = parseFloat(options.opacity || '1.0');
        if (opacity !== 1.0 && opacity >= 0 && opacity <= 1) {
          console.log(chalk.gray(`   👻 Opacity: ${opacity * 100}%`));
        }

        // Parse pages
        let targetPages: string = 'all pages';
        if (options.pages !== 'all') {
          const pageNumbers = options.pages
            .split(',')
            .map((p: string) => parseInt(p.trim()))
            .filter((p: number) => !isNaN(p) && p > 0);

          if (pageNumbers.length > 0) {
            targetPages = `page${pageNumbers.length > 1 ? 's' : ''} ${pageNumbers.join(', ')}`;
          }
        }
        console.log(chalk.gray(`   📄 Target: ${targetPages}`));

        // First, get info about the PDF
        const pageCount = showProgress('📋 Analyzing PDF...', () =>
          getPdfInfoBeforeSigning(absolutePath),
        );
        console.log(
          chalk.magenta('\n📄 Document has'),
          chalk.cyan.bold(pageCount),
          chalk.magenta('pages'),
        );

        // Create enhanced signature text with metadata
        const enhancedSignature = `${signature} [fs:${fontSize}|c:${options.color || 'black'}|pos:${options.position || 'bottom-right'}|rot:${rotation}|op:${opacity}]`;

        // Sign the PDF copy using the Rust function with enhanced signature text
        showProgress('✍️  Applying signature...', () =>
          signPdf(outputPath, enhancedSignature),
        );

        console.log(
          chalk.green('\n✅ Success!'),
          chalk.bold('PDF signed with enhanced signature'),
        );
        console.log(chalk.blue('📁 Original:'), chalk.gray(absolutePath));
        console.log(chalk.blue('📁 Signed:'), chalk.green(outputPath));
        console.log(
          chalk.yellow('💡 Note:'),
          chalk.gray('Visual options are encoded in signature metadata'),
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(chalk.red('❌ Error:'), chalk.white(err.message));
        } else {
          console.error(chalk.red('❌ Error:'), chalk.white(String(err)));
        }
        process.exit(1);
      }
    },
  );

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
