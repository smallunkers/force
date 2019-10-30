/* eslint no-underscore-dangle: off */
/* eslint @typescript-eslint/camelcase: off */

const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const safeParser = require('postcss-safe-parser')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const _ = require('lodash')
const pkg = require('./package.json')

// 入口配置
let entry = {}
// styl 文件编译器配置
const stylLoader = {
  use: ['css-loader', 'postcss-loader', 'stylus-loader'],
  include: [],
}
// 插件配置
let plugins = []
// 生成 source map 的方式
let devtool
// 打包模式
const mode = process.env.NODE_ENV
// 内置的包名
const [prefix, pkgName] = pkg.name.split('/')
const library = _.upperFirst(_.camelCase(pkgName))
// 检测是否为开发环境
const __DEV__ = mode === 'development'

if (__DEV__) {
  entry = {
    demo: './demo/index.tsx',
    [pkgName]: './src/index.ts',
  }
  stylLoader.use.unshift('style-loader')
  stylLoader.include = [
    path.resolve(__dirname, 'src'), path.resolve(__dirname, 'demo'),
  ]
  plugins = [
    new webpack.HotModuleReplacementPlugin(),
  ]
  devtool = 'cheap-eval-source-map'
} else {
  entry = {
    [`${pkgName}.min`]: ['./src/index.styl', './src/index.ts'],
  }
  stylLoader.use.unshift(MiniCssExtractPlugin.loader)
  stylLoader.include = [
    path.resolve(__dirname, 'src'),
  ]
  plugins = [
    new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
    new MiniCssExtractPlugin({
      filename: `${pkgName}.min.css`,
    }),
    new webpack.BannerPlugin(`
      ${pkgName} v${pkg.version}
      Copyright 2019-present oner-team.
      All rights reserved.
    `),
    /**
     * ! 一般不需要开启, 默认打包出来的 stats.json 文件会随着项目增大而变大
     *   如果发现项目中出现某些文件打包很大时, 执行 npm run build 之后执行 npm run analyzer 进行文件分析和打包优化
     */
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'disabled',
    //   generateStatsFile: true,
    // }),
  ]
  devtool = 'source-map'
}


module.exports = {
  mode,
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
    library,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devServer: {
    contentBase: [path.join(__dirname, 'demo'), path.join(__dirname, 'node_modules')],
    compress: true,
    inline: true,
    hot: true,
    port: 9002,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        ...stylLoader,
      },
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            query: {
              name: '[name].[hash:8].[ext]',
              limit: 1024 * 10,
            },
          },
        ],
      },
    ],
  },
  plugins,
  devtool,
  externals: {
    react: {
      var: 'React',
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
    'react-dom': {
      var: 'ReactDOM',
      root: 'ReactDOM',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
    },
    d3: {
      var: 'd3',
      root: 'd3',
      commonjs: 'd3',
      commonjs2: 'd3',
      amd: 'd3',
    },
    lodash: {
      var: '_',
      root: '_',
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
    },
    moment: {
      var: 'moment',
      root: 'moment',
      commonjs: 'moment',
      commonjs2: 'moment',
      amd: 'moment',
    },
  },
}
