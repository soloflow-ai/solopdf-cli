# Development Workflow

This document describes the development and testing workflow for SoloPDF CLI.

## Quick Validation During Development

For rapid feedback during development, use the quick check script:

```bash
./scripts/quick-check.sh
```

This runs:
- Rust formatting check
- Rust clippy (linting)
- Rust tests
- NAPI build

## Pre-Publish Validation

Before publishing or submitting PRs, run the full validation:

```bash
./scripts/validate-pre-publish.sh
```

This runs the complete test suite including:
- All Rust checks and tests
- Node.js linting and tests
- Integration tests
- Build validation

## VS Code Tasks

Use Ctrl+Shift+P → "Tasks: Run Task" to access these tasks:

### Development Tasks
- **Quick Check**: Fast validation for development
- **Rust Format Fix**: Auto-format Rust code
- **Watch Build Rust**: Continuously build on changes
- **Watch Test Rust**: Continuously test on changes

### Testing Tasks
- **Rust Format Check**: Check formatting without fixing
- **Rust Clippy**: Run Rust linter
- **Rust Unit Tests**: Run Rust tests
- **Node Lint**: Run Node.js linter
- **Node Unit Tests**: Run Node.js unit tests
- **Node Integration Tests**: Run integration tests
- **Node CLI Tests**: Run CLI tests

### Build Tasks
- **Build Rust Core**: Build the Rust NAPI module
- **Build Node Wrapper**: Build the Node.js wrapper
- **Build All**: Build everything
- **Generate Test PDFs**: Create test PDF files

### Validation Tasks
- **Run Full Rust Validation**: Complete Rust validation
- **Run Full Node Validation**: Complete Node.js validation
- **Pre-Publish Validation**: Complete validation for both
- **Quick Pre-Publish Validation**: Full validation script

### CI Testing
- **Test CI Locally (Rust Core)**: Test only Rust CI job
- **Test CI Locally (Node Wrapper)**: Test only Node CI job
- **Test CI Locally (Full)**: Test complete CI pipeline

## CI/CD Pipeline

The project uses GitHub Actions with three jobs:
1. **rust-core**: Validates Rust code, builds NAPI module
2. **node-wrapper**: Validates Node.js code, runs tests
3. **integration-test**: Full integration testing

Use `act` to test CI locally:
```bash
# Test specific job
act --job rust-core
act --job node-wrapper

# Test full pipeline
act
```

## Publishing Checklist

1. ✅ Run `./scripts/validate-pre-publish.sh`
2. ✅ Test CI locally with `act`
3. ✅ Commit all changes
4. ✅ Create release tag
5. ✅ Push to GitHub
6. ✅ Wait for CI to pass
7. ✅ Publish to npm

## Common Issues

### Rust Formatting
Run `cargo fmt` in the `rust-core` directory to fix formatting.

### Clippy Warnings
Address clippy warnings - they're treated as errors in CI.

### NAPI Build Issues
Ensure you have the latest Node.js and Rust toolchain.

### Test Failures
Check that all dependencies are installed and environment is set up correctly.
