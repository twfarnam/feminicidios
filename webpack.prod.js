const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'bundle.[contenthash].js',
    sourceMapFilename: '[file].map',
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.[contenthash].css',
    }),
  ],
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

// replace style-loader with mini-css-extract-plugin
module.exports.module.rules[1].use[0] = MiniCssExtractPlugin.loader
