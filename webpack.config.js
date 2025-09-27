const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    popup: './src/popup/main.ts',
    content: './src/content/content.ts',
    background: './src/background/background.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.svelte'],
    alias: {
      svelte: path.dirname(require.resolve('svelte/package.json'))
    },
    mainFields: ['svelte', 'browser', 'module', 'main'],
    conditionNames: ['svelte']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: process.env.NODE_ENV === 'development'
            },
            emitCss: true,
            hotReload: false,
            preprocess: require('svelte-preprocess')({
              postcss: true,
              typescript: {
                tsconfigFile: './tsconfig.json'
              }
            })
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map'
};