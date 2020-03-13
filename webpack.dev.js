const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  output: {
    publicPath: 'http://localhost:8080/',
    filename: 'dist/bundle.js',
  },
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    hot: true,
    sockPort: 8080,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})
