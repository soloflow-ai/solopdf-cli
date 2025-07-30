// eslint.config.js
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Global ignores
    ignores: ['node_modules/**', 'dist/**'],
  },
  // Base config for TypeScript files
  ...tseslint.configs.recommended,
  // Prettier config must be last to override styling rules
  prettierConfig,
);
