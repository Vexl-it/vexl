module.exports = {
  root: true,
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'standard-with-typescript',
    'prettier',
    './index.js',
  ],
  plugins: ['react'],
  // 'overrides': [
  //   {
  //     'files': ['**/*.test.js', '**/*.test.jsx'],
  //     'env': {
  //       'jest': true,
  //     },
  //   },
  // ],
  'settings': {
    'react': {
      'version': 'detect',
    },
  },
  rules: {
    'react-hooks/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'array-callback-return': 'off',
  },
}
