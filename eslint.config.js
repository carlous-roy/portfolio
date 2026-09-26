import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'node_modules/', 'public/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
  },
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      // Safari removes list semantics from a <ul> styled with list-style: none,
      // so an explicit role="list" is deliberate there.
      'jsx-a11y/no-redundant-roles': ['error', { ul: ['list'] }],
    },
  },
  reactHooks.configs.flat.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['api/**/*.js', 'scripts/**/*.{js,mjs}', '*.config.js', '**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
]
