import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import vitest from 'eslint-plugin-vitest'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

// eslint-disable-next-line @typescript-eslint/no-deprecated
export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '*.min.js',
      'ignore/**',
      '*.config.mjs' // Ignore plain JS/MJS config files
    ]
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Vue rules
  ...pluginVue.configs['flat/recommended'],

  // TypeScript parser options for all TS-like files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue']
      }
    }
  },

  // Import sorting plugin
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Vue imports
            ['^vue$', '^vue-router$'],
            // Third-party packages
            ['^@?\\w'],
            // Base imports (@/base/)
            ['^@/base/'],
            // Shared imports (@/shared/)
            ['^@/shared/'],
            // Module/relative imports
            ['^@/', '^\\.\\./'],
            // Relative imports from same directory
            ['^\\./'],
            // Type imports
            ['^.*\\u0000$']
          ]
        }
      ],
      'simple-import-sort/exports': 'error'
    }
  },

  // Sort destructure keys plugin
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      'sort-destructure-keys': sortDestructureKeys
    },
    rules: {
      'sort-destructure-keys/sort-destructure-keys': 'error'
    }
  },

  // Vitest rules for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'test/**/*.ts'],
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/require-top-level-describe': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
      // Relax some TypeScript rules for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },

  // Custom rules for all files
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Vue
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineProps', 'defineEmits', 'defineSlots']
        }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' }
        }
      ],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/attributes-order': ['error', { alphabetical: true }],
      'vue/multi-word-component-names': 'off', // Allow single-word page components

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Script files (seed data, build scripts) - allow console.log
  // This must come AFTER the main rules to override them
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },

  // Prettier (must be last to override other formatting rules)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  eslintConfigPrettier
)
