module.exports = {
  'env': {
    'browser': true,
    'es2020': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 11,
    'sourceType': 'module'
  },
  'plugins': [
    'react'
  ],
  'rules': {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 0,
    'comma-dangle': [ 2, 'never' ],
    'semi': [ 2,'never' ],
    'quotes': [ 2,'single' ],
    'indent': [ 2,2,{
      'SwitchCase': 1
    } ],
    'no-console': 0,
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ]
  },
  'globals': {
    'React': 'writable'
  }
}
