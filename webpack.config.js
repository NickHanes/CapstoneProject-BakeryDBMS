const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry file for your app
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile JavaScript files
        },
      },
      // Add other loaders (e.g., CSS, image files) as needed
    ],
  },
  devtool: 'source-map', // Enable source maps for debugging
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
