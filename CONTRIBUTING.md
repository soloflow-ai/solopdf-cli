# Contributing to SoloPDF

> First off, thank you for considering contributing to SoloPDF\! It's people like you that make the open-source community such an amazing place. We welcome any and all contributions.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open-source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

-----

## 📜 Code of Conduct

We have adopted a **[Code of Conduct](https://www.google.com/search?q=LINK_TO_CODE_OF_CONDUCT.md)** that we expect project participants to adhere to. Please read the full text so that you can understand what actions will and will not be tolerated.

-----

## 🤔 How Can I Contribute?

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into SoloPDF itself.

### 🐛 Reporting Bugs

  * **Search existing issues:** Use the [GitHub Issues search](https://www.google.com/search?q=LINK_TO_ISSUES) to check if the issue has already been reported.
  * **Open a new issue:** If you're unable to find an open issue addressing the problem, **[open a new one](https://www.google.com/search?q=LINK_TO_NEW_ISSUE)**.
  * **Be detailed:** Be sure to include a clear title and description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring. Use one of our issue templates to ensure you provide all necessary information.

### ✨ Suggesting Enhancements

  * **Search existing issues:** Use the [GitHub Issues search](https://www.google.com/search?q=LINK_TO_ISSUES) to check if the enhancement has already been suggested.
  * **Open a new issue:** If it hasn't been suggested, **[open a new issue](https://www.google.com/search?q=LINK_TO_NEW_ISSUE)** to start a discussion.
  * **Provide context:** Give a clear and detailed explanation of the feature you want, why it's important, and what use case it solves.

-----

## 💻 Your First Code Contribution

Unsure where to begin contributing to SoloPDF? You can start by looking through these beginner-friendly issues:

  * **[Good First Issues](https://www.google.com/search?q=LINK_TO_GOOD_FIRST_ISSUES)**: Issues that should only require a few lines of code and a test or two.
  * **[Help Wanted Issues](https://www.google.com/search?q=LINK_TO_HELP_WANTED_ISSUES)**: Issues that are a bit more involved but are great for getting familiar with the codebase.

### Development Setup

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/solopdf.git
    ```
3.  **Navigate to the project directory:**
    ```bash
    cd solopdf
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    ```
5.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b your-feature-name
    ```

### Pull Request Process

1.  **Make your changes:** Add new features or fix bugs in your branch.
2.  **Add tests\!** Your patch won't be accepted if it doesn't have tests. We use **Jest** for testing. Run all tests to ensure they pass:
    ```bash
    npm test
    ```
3.  **Ensure the code lints and is formatted.** We use ESLint and Prettier for code style. Run the linter and formatter before committing:
    ```bash
    npm run lint
    npm run format
    ```
4.  **Update the documentation.** If you added a new feature or changed an existing one, update the `README.md` or other relevant documentation files.
5.  **Issue that pull request\!** Push your branch to your fork and open a pull request. Make sure your PR description clearly describes the problem and solution. Include the relevant issue number if applicable (e.g., `Closes #123`).

-----

## 🎨 Coding Style

  * We use **TypeScript**.
  * We follow the **Airbnb JavaScript Style Guide** with some modifications.
  * Code is automatically formatted using **Prettier** and checked with **ESLint**. Please run `npm run format` before committing your changes to ensure consistency.

Thank you again for your contribution\! 🎉
