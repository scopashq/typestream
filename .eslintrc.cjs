module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.eslint.json',
      './workspace/*/tsconfig.json',
      './packages/*/tsconfig.json',
    ],
    extraFileExtensions: ['.cjs'],
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // Already checked by TypeScript
    'no-undef': 'off',
    'import/no-unresolved': 'off',

    // We know what we're doing™
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-types': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-process-exit': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/no-null': 'off',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-json-parse-buffer': 'off',
    'unicorn/text-encoding-identifier-case': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/filename-case': [
      'error',
      { case: 'kebabCase', ignore: [/\/generated-types\//] },
    ],

    // Additional code quality rules
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: false },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowAny: true, allowUnknown: true },
    ],
    '@typescript-eslint/restrict-plus-operands': 'error',

    // Additional code style rules
    'object-shorthand': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroupsExcludedImportTypes: [],
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
  },
}
