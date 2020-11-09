modules.export = {
  'env': {
    'browser': true,
    'es2020': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 11,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
  ],
  'rules': {
    'react/react-in-jsx-scope': 'off',
    "semi": "never",
    'quotes': 'single',
    "indent": [
      "warn",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "no-console": "warn"
  },
  "globals": {
    "React": "writable"
  }
};
