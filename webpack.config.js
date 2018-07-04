const MODE = 'development';

module.exports = {
  entry: {
    install: './docs/js/src/main.ts'
  },
  mode: MODE,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader'
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: `${__dirname}/js/dist`
  }
}