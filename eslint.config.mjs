import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

const LOCATOR_METHODS = 'locator|getByRole|getByText|getByTestId|getByLabel|getByPlaceholder|getByAltText|getByTitle|\\$|\\$\\$';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/playwright-report/**', '**/test-results/**', '**/blob-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
    },
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  },
  {
    files: ['libs/**/*.ts', 'apps/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]'] }],
      'playwright/no-standalone-expect': 'off',
      'playwright/prefer-locator': 'off',
    },
  },
  {
    files: ['apps/*/auth.setup.ts'],
    rules: { 'playwright/expect-expect': 'off' },
  },
  {
    files: ['apps/**/tests/**/*.spec.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.property.name=/^(${LOCATOR_METHODS})$/]`,
          message: 'No raw locators in specs. Add a named getter to the page or component object.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@playwright/test', message: "Import test/expect from the suite's src/fixtures/test.fixture." }],
        },
      ],
    },
  }
);
