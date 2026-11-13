const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css' },
        {
          from: 'js',
          to: 'js',
          globOptions: {
            ignore: ['**/main.js', '**/app.js'],
          },
        },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'sw.js', to: 'sw.js' },
      ],
    }),
  ],
});
