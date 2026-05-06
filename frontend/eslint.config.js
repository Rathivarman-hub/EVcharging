import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React 17+ JSX transform doesn't require importing React in every file.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' }],
      // Keep fast-refresh checks lightweight for this app's current module structure.
      'react-refresh/only-export-components': 'off',
      // Disable strict compiler-oriented hooks rules that don't match this codebase yet.
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
