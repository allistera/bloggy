import astro from 'eslint-plugin-astro';
import babelParser from '@babel/eslint-parser';

const typescriptParserOptions = {
  requireConfigFile: false,
  babelOptions: {
    parserOpts: {
      plugins: ['typescript', 'jsx'],
    },
  },
};

export default [
  {
    ignores: ['dist/', '.vercel/', 'playwright-report/', 'test-results/'],
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: '@babel/eslint-parser',
        ...typescriptParserOptions,
      },
    },
  },
  {
    files: ['**/*.{ts,mjs,js}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: typescriptParserOptions,
    },
  },
];
