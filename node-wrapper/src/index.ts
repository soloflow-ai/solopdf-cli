#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import {
  getPageCount,
  signPdfWithOptions,
  getPdfInfoBeforeSigning,
  SigningOptions,
} from './platform-loader.js';
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

// Function to parse page numbers from page option
function parsePageNumbers(pageOption: string, totalPages: number): number[] {
  if (pageOption === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (pageOption === 'even') {
    return Array.from(
      { length: Math.floor(totalPages / 2) },
      (_, i) => (i + 1) * 2,
    ).filter((p) => p <= totalPages);
  }

  if (pageOption === 'odd') {
    return Array.from(
      { length: Math.ceil(totalPages / 2) },
      (_, i) => i * 2 + 1,
    ).filter((p) => p <= totalPages);
  }

  // Parse comma-separated list like "1,2,5"
  return pageOption
    .split(',')
    .map((p: string) => parseInt(p.trim()))
    .filter((p: number) => !isNaN(p) && p > 0 && p <= totalPages)
    .sort((a, b) => a - b);
}

// Get version from package.json
const packageJsonPath = new URL('../../package.json', import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const program = new Command();

program
  .name('solopdf')
  .description('A CLI tool for PDF operations')
  .version(packageJson.version);

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
  .description(
    chalk.yellow('Get information about a PDF file before watermarking.'),
  )
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
  .command('watermark')
  .description(chalk.yellow('Add a watermark text to a PDF file with options.'))
  .argument('<file>', 'The path to the PDF file to watermark')
  .argument('<text>', 'The watermark text to add')
  .argument('<output>', 'The output path for the watermarked PDF')
  .option(
    '--font-size <size>',
    'Font size for the watermark (visual only)',
    '12',
  )
  .option(
    '--color <color>',
    'Color of the watermark text (visual only)',
    'black',
  )
  .option(
    '--x-position <x>',
    'X coordinate for watermark placement (visual only)',
  )
  .option(
    '--y-position <y>',
    'Y coordinate for watermark placement (visual only)',
  )
  .option(
    '--pages <pages>',
    'Pages to watermark: "even", "odd", "all", or comma-separated list (e.g., "1,3,5")',
    'all',
  )
  .option(
    '--position <position>',
    'Predefined position (visual only)',
    'bottom-right',
  )
  .option(
    '--rotation <degrees>',
    'Rotation angle in degrees (visual only)',
    '0',
  )
  .option(
    '--opacity <opacity>',
    'Opacity level 0.0 to 1.0 (visual only)',
    '1.0',
  )
  .action(
    (
      file: string,
      watermarkText: string,
      output: string,
      options: Record<string, string>,
    ) => {
      try {
        const absolutePath = path.resolve(file);
        const outputPath = path.resolve(output);

        console.log(chalk.blue('📄 Input PDF:'), chalk.white(absolutePath));
        console.log(chalk.blue('✍️  Output PDF:'), chalk.white(outputPath));
        console.log(
          chalk.blue('📝 Watermark text:'),
          chalk.yellow(`"${watermarkText}"`),
        );

        // Check if input file exists
        try {
          fs.accessSync(absolutePath);
        } catch {
          throw new Error(`Input file not found: ${absolutePath}`);
        }

        // First, get info about the PDF to determine pages
        const pageCount = showProgress('📋 Analyzing PDF...', () =>
          getPdfInfoBeforeSigning(absolutePath),
        );
        console.log(
          chalk.magenta('\n📄 Document has'),
          chalk.cyan.bold(pageCount),
          chalk.magenta('pages'),
        );

        // Parse page numbers based on the new options
        const pageNumbers = parsePageNumbers(options.pages, pageCount);
        if (pageNumbers.length === 0) {
          throw new Error('No valid pages selected for watermarking');
        }

        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        // Copy input file to output location
        console.log(chalk.cyan('📋 Creating copy...'));
        fs.copyFileSync(absolutePath, outputPath);

        // Display parsed options for user feedback
        console.log(chalk.cyan('\n📋 Watermark Options:'));

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

        // Display target pages
        let targetPagesText: string;
        if (options.pages === 'all') {
          targetPagesText = 'all pages';
        } else if (options.pages === 'even') {
          targetPagesText = 'even pages';
        } else if (options.pages === 'odd') {
          targetPagesText = 'odd pages';
        } else {
          targetPagesText = `page${pageNumbers.length > 1 ? 's' : ''} ${pageNumbers.join(', ')}`;
        }
        console.log(chalk.gray(`   📄 Target: ${targetPagesText}`));

        // Parse watermark options for the Rust function
        const signingOptions: SigningOptions = {
          fontSize: fontSize,
          color: options.color || 'black',
          xPosition: options.xPosition
            ? parseFloat(options.xPosition)
            : undefined,
          yPosition: options.yPosition
            ? parseFloat(options.yPosition)
            : undefined,
          pages: pageNumbers,
          position: options.position || 'bottom-right',
          rotation: rotation,
          opacity: opacity,
        };

        // Add watermark to the PDF copy using the advanced Rust function with proper options
        showProgress('✍️  Applying watermark...', () => {
          return signPdfWithOptions(
            outputPath,
            watermarkText,
            signingOptions,
          );
        });

        console.log(
          chalk.green('\n✅ Success!'),
          chalk.bold('PDF watermarked with advanced options'),
        );
        console.log(chalk.blue('📁 Original:'), chalk.gray(absolutePath));
        console.log(chalk.blue('📁 Watermarked:'), chalk.green(outputPath));
        console.log(
          chalk.yellow('💡 Note:'),
          chalk.gray('Visual options are encoded in watermark metadata'),
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

// Checksum Command

program
  .command('checksum')
  .description(chalk.yellow('Get file checksum for verification'))
  .argument('<file>', 'The path to the PDF file')
  .action(async (file: string) => {
    try {
      const core = await import('./platform-loader.js');

      const absolutePath = path.resolve(file);
      console.log(chalk.blue('🔍 Analyzing file:'), chalk.white(absolutePath));

      // Check if input file exists
      try {
        fs.accessSync(absolutePath);
      } catch {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const checksum = showProgress('🔐 Calculating checksum...', () =>
        core.getPdfChecksum(absolutePath),
      );

      console.log(chalk.green('✅ Success!'), chalk.bold('File Checksum:'));
      console.log(chalk.blue('   🔐 Checksum:'), chalk.cyan.bold(checksum));
      console.log(chalk.blue('   📁 File:'), chalk.gray(absolutePath));
      console.log(
        chalk.yellow(
          '💡 Share this checksum with recipients for file verification',
        ),
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

// Digital Signature Commands

program
  .command('generate-key')
  .description(
    chalk.yellow('Generate a new cryptographic key pair for digital signing'),
  )
  .option(
    '--output <file>',
    'Save key pair to file (default: keypair.json)',
    'keypair.json',
  )
  .action(async (options: { output: string }) => {
    try {
      const core = await import('./platform-loader.js');

      console.log(chalk.blue('🔑 Generating signing key pair...'));

      const keyPair = showProgress('🔐 Creating cryptographic keys...', () =>
        core.generateSigningKeyPair(),
      );

      const keyInfo = showProgress('📋 Extracting key information...', () =>
        core.getKeyInfoFromJson(keyPair),
      );

      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, keyPair);

      const parsedInfo = JSON.parse(keyInfo);
      console.log(chalk.green('✅ Success!'), chalk.bold('Key pair generated'));
      console.log(
        chalk.blue('   🔑 Fingerprint:'),
        chalk.cyan(parsedInfo.fingerprint),
      );
      console.log(chalk.blue('   📁 Saved to:'), chalk.gray(outputPath));
      console.log(chalk.yellow('⚠️  Keep your private key secure!'));
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
  .command('sign-digital')
  .description(chalk.yellow('Sign a PDF file with a digital signature'))
  .argument('<file>', 'The path to the PDF file to sign')
  .argument('<output>', 'The output path for the signed PDF')
  .argument('<keyfile>', 'The path to the key pair JSON file')
  .option(
    '--text <text>',
    'Visible signature text (default: "DIGITALLY SIGNED")',
  )
  .option('--save-sig <file>', 'Save signature info to file')
  .action(
    async (
      file: string,
      output: string,
      keyfile: string,
      options: { text?: string; saveSig?: string },
    ) => {
      try {
        const core = await import('./platform-loader.js');

        const absolutePath = path.resolve(file);
        const outputPath = path.resolve(output);
        const keyfilePath = path.resolve(keyfile);

        console.log(chalk.blue('📄 Input PDF:'), chalk.white(absolutePath));
        console.log(chalk.blue('✍️  Output PDF:'), chalk.white(outputPath));
        console.log(chalk.blue('🔑 Key file:'), chalk.white(keyfilePath));

        // Check if input file exists
        try {
          fs.accessSync(absolutePath);
        } catch {
          throw new Error(`Input file not found: ${absolutePath}`);
        }

        // Check if key file exists
        try {
          fs.accessSync(keyfilePath);
        } catch {
          throw new Error(`Key file not found: ${keyfilePath}`);
        }

        // Load key pair
        const keyPairJson = fs.readFileSync(keyfilePath, 'utf8');
        const keyPair = JSON.parse(keyPairJson);

        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        // Sign the PDF
        const signatureText = options.text || null;
        console.log(chalk.cyan('🔐 Digitally signing PDF...'));

        const result = showProgress('📝 Creating digital signature...', () =>
          core.signPdfWithKey(
            absolutePath,
            outputPath,
            keyPair.private_key,
            signatureText,
          ),
        );

        const parsedResult = JSON.parse(result);

        // Save signature info if requested
        if (options.saveSig) {
          const sigPath = path.resolve(options.saveSig);
          fs.writeFileSync(sigPath, JSON.stringify(parsedResult, null, 2));
          console.log(
            chalk.blue('💾 Signature saved to:'),
            chalk.gray(sigPath),
          );
        }

        console.log(
          chalk.green('✅ Success!'),
          chalk.bold('PDF digitally signed'),
        );
        console.log(chalk.blue('   📄 Original:'), chalk.gray(absolutePath));
        console.log(chalk.blue('   📄 Signed:'), chalk.gray(outputPath));
        console.log(
          chalk.blue('   🕐 Timestamp:'),
          chalk.cyan(parsedResult.signature_info.timestamp),
        );
        console.log(
          chalk.blue('   🔐 Algorithm:'),
          chalk.cyan(parsedResult.signature_info.algorithm),
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

program
  .command('verify-signature')
  .description(chalk.yellow('Verify a digital signature on a PDF file'))
  .argument('<file>', 'The path to the signed PDF file')
  .argument('<signature>', 'The path to the signature info JSON file')
  .argument(
    '<keyfile>',
    'The path to the key pair JSON file (public key will be used)',
  )
  .action(async (file: string, signature: string, keyfile: string) => {
    try {
      const core = await import('./platform-loader.js');

      const filePath = path.resolve(file);
      const signaturePath = path.resolve(signature);
      const keyfilePath = path.resolve(keyfile);

      console.log(chalk.blue('📄 PDF file:'), chalk.white(filePath));
      console.log(chalk.blue('📋 Signature:'), chalk.white(signaturePath));
      console.log(chalk.blue('🔑 Key file:'), chalk.white(keyfilePath));

      // Check files exist
      try {
        fs.accessSync(filePath);
        fs.accessSync(signaturePath);
        fs.accessSync(keyfilePath);
      } catch {
        throw new Error(`One or more files not found`);
      }

      // Load files
      const signatureInfo = fs.readFileSync(signaturePath, 'utf8');
      const keyPairJson = fs.readFileSync(keyfilePath, 'utf8');
      const keyPair = JSON.parse(keyPairJson);

      // Extract signature info
      const signatureData = JSON.parse(signatureInfo);
      const sigInfo = signatureData.signature_info || signatureData;

      console.log(chalk.cyan('🔍 Verifying digital signature...'));

      const result = showProgress('🔐 Validating signature...', () =>
        core.verifyPdfSignature(
          filePath,
          JSON.stringify(sigInfo),
          keyPair.public_key,
        ),
      );

      const verification = JSON.parse(result);

      if (verification.is_valid) {
        console.log(
          chalk.green('✅ SUCCESS!'),
          chalk.bold('Digital signature is VALID'),
        );
        console.log(chalk.blue('   🎉 Document is authentic and unmodified'));
      } else {
        console.log(
          chalk.red('❌ FAILED!'),
          chalk.bold('Digital signature is INVALID'),
        );
        console.log(
          chalk.blue('   📝 Reason:'),
          chalk.yellow(verification.message),
        );
      }

      console.log(
        chalk.blue('   🕐 Verified at:'),
        chalk.cyan(verification.verified_at),
      );

      if (verification.signature_info) {
        console.log(
          chalk.blue('   📅 Signed at:'),
          chalk.cyan(verification.signature_info.timestamp),
        );
        console.log(
          chalk.blue('   🔐 Algorithm:'),
          chalk.cyan(verification.signature_info.algorithm),
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(chalk.red('❌ Error:'), chalk.white(err.message));
      } else {
        console.error(chalk.red('❌ Error:'), chalk.white(String(err)));
      }
      process.exit(1);
    }
  });

program.parse();
