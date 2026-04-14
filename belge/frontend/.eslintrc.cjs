module.exports = {
  root: true,
  extends: [
    '@nuxt/eslint-config'
  ],
  rules: {
    'vue/no-mutating-props': 'error',
    'vue/no-multiple-template-root': 'error',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/no-dupe-v-else-if': 'error',
    'vue/no-expose-after-await': 'error',
    'no-useless-escape': 'error',
    'no-empty': 'error',
    'vue/no-unused-vars': 'error',
    'vue/require-v-for-key': 'error',
    'vue/no-deprecated-filter': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
