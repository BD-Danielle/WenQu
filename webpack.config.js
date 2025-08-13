const path = require('path');
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
              '@babel/plugin-proposal-private-methods'
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    moduleIds: 'deterministic',
    minimize: true
  }
}