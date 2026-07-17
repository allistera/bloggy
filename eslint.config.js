import astro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/', '.vercel/', 'playwright-report/', 'test-results/'],
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
];
