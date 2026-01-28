const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const VERSION = '3.0.0';

module.exports = {
  mode: 'production',
  entry: {
    wenqu: './js/index.js'  // 主入口點
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `wenqu.bundle.v${VERSION}.js`,
    library: {
      type: 'umd',
      name: 'WenQu',
      export: 'default',
      umdNamedDefine: true
    },
    globalObject: 'globalThis'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-private-methods',
              'transform-remove-console' // 新增這行
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  // ... 其他設定 ...
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除所有 console.*
          },
        },
      }),
    ],
  }
}