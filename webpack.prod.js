const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
  },
  devtool: 'source-map',
  plugins: [ ],
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true,
      }),
    ],
  },
})
