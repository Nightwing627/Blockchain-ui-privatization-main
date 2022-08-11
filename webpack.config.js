const path = require('path');

module.exports = {
  entry: {
    utils: [path.join(__dirname, 'utils/home.js')],
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'var',
    libraryExport: 'default',
    library: 'BlockChainUtils',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
