import withNuxt from './.nuxt/eslint.config.mjs'

export default [
  ...withNuxt,

  {
    rules: {
      /* -----------------------------
       * ❌ REMOVE FORMATTING NOISE
       * ----------------------------- */
      '@stylistic/indent': 'off',
      '@stylistic/no-trailing-spaces': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/keyword-spacing': 'off',
      '@stylistic/eol-last': 'off',

      /* -----------------------------
       * ❌ TOO NOISY / LOW VALUE
       * ----------------------------- */
      'vue/multi-word-component-names': 'off',

      /* -----------------------------
       * ✅ KEEP REAL BUG DETECTION
       * ----------------------------- */

      // TypeScript safety
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // JS correctness
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-case-declarations': 'error',

      // Vue correctness
      'vue/no-unused-components': 'warn',
      'vue/no-mutating-props': 'error',
      'vue/no-dupe-keys': 'error',

      // Async safety
      'require-await': 'error'
    }
  }
]