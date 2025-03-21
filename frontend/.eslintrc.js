module.exports = {
  root: true,
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Treat all TypeScript-related warnings as errors
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    
    // React-specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error'
  }
}; 