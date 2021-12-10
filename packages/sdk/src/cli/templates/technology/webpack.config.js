const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: {
    'actions': './src/actions.js',
    'values': './src/values.js'
  },
  output: {
    library: {
      type: 'commonjs',
    },
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
};
