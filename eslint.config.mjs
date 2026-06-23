import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: [
      'apps/backend/**/*.ts',
      'packages/backend/**/*.ts',
      'packages/prisma/**/*.ts',
      'scripts/**/*.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  ...pluginVue.configs['flat/recommended'].map((cfg) => ({
    ...cfg,
    files: [
      'apps/frontend/**/*.ts',
      'apps/frontend/**/*.vue',
      'packages/frontend/**/*.ts',
      'packages/frontend/**/*.vue',
      'packages/share/**/*.ts',
    ],
    languageOptions: {
      ...cfg.languageOptions,
      parser: vueParser,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        parser: tseslint.parser,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      ...cfg.rules,
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  })),

  eslintConfigPrettier,
];
