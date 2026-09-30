import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.kiro/**',
      '.kilo/**',
      '.storybook/preview.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
        ...globals.jest,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/jsx-no-undef': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react/no-unknown-property': 'warn',
      'react/no-unescaped-entities': 'warn',
      'no-case-declarations': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-control-regex': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    // #964 — user-facing components must not invent numbers with Math.random().
    // Simulated data belongs in src/lib/demoData and must be rendered behind
    // <DemoDataProvider>, which shows a visible "Demo data" badge.
    files: ['src/components/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Math.random() is restricted in src/components. Move simulated/user-visible data to src/lib/demoData and render it behind <DemoDataProvider> (src/components/demo/DemoDataProvider.tsx). Pure ID generation, model jitter, or example-only uses may be added to the allow-list in eslint.config.js after review. See docs/DATA_AUTHENTICITY.md.',
        },
      ],
    },
  },
  {
    // Allow-list for the Math.random() restriction above. Each entry must name
    // its category (ID / jitter / example) — fake data is NOT allowed here.
    files: [
      // ID: session-scoped operation IDs (Date.now() + Math.random())
      'src/components/dashboard/TransactionBuilder.tsx',
      // Jitter: ±noise on the synthetic training history of the congestion forecast model
      'src/components/layout/widgets/CongestionForecastWidget.tsx',
      // Example-only: intentionally random failure injection for the error-handling demo
      'src/components/examples/ErrorHandlingExample.tsx',
    ],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
];
