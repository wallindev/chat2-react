import webpack from 'webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';

import conf from './src/server/include/config';

const nameClient = `client-${conf.NODE_ENV}`;
const nameServer = `server-${conf.NODE_ENV}`;
const mode = conf.NODE_ENV;
const entryIndexClient = conf.DEVMODE ? [
  'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true',
  './src/client/index'
] : './src/client/index';
const entryIndexServer = './src/server/server';
const distPath = path.resolve(__dirname, 'dist');
const bundlePath = `${distPath}/js`;
const bundleClient = `client.${conf.DEVMODE ? 'dev' : '[hash]'}.js`;
const bundleServer = `server.js`;
const publicPath = `http://localhost:${conf.APP_PORT}/js/`;
const hotUpdate = conf.DEVMODE ? {
  hotUpdateChunkFilename: ".hot/[id].[hash].hot-update.js",
  hotUpdateMainFilename: ".hot/[hash].hot-update.json"
} : null ;
const devServerStats = {
  all: false,
  colors: true,
  entrypoints: true,
  publicPath: true,
  modules: true,
  maxModules: Infinity,
  errors: true,
  errorDetails: true,
};
const stats = 'errors-only';
const loader = `babel-loader${conf.PRODMODE ? '?compact=true' : ''}`;
const moduleRulesJs = {
  test: /\.jsx?$/,
  exclude: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'dist')],
  use: loader
};
const moduleRulesCss = { test: /\.(css)$/, use: ['style-loader', 'css-loader'] };
const optimization = {
  minimize: conf.DEVMODE ? false : true,
};
const resolve = {
  extensions: ['.js', '.jsx']
};
const plugins = conf.DEVMODE ? [new webpack.HotModuleReplacementPlugin()] : [];
const externals = [nodeExternals()];
const devtool = conf.DEVMODE ? 'inline-source-map' : '';

const clientConfig = {
  name: nameClient,
  mode,
  target: 'web',
  entry: entryIndexClient,
  output: {
    path: bundlePath,
    filename: bundleClient,
    publicPath: publicPath,
    ...hotUpdate,
  },
  devServer: conf.DEVMODE ? {
    compress: false,
    publicPath: publicPath,
    stats: devServerStats,
    writeToDisk: false,
    hot: true,
  } : {},
  stats,
  module: {
    rules: [
      moduleRulesJs,
      moduleRulesCss,
    ]
  },
  optimization,
  resolve,
  plugins,
  devtool,
}

const serverConfig = {
  name: nameServer,
  mode,
  target: 'node',
  entry: entryIndexServer,
  output: {
    path: distPath,
    filename: bundleServer,
  },
  stats,
  module: {
    rules: [
      moduleRulesJs,
    ]
  },
  optimization,
  resolve,
  externals,
  devtool,
  node: {
    __dirname: true,
    __filename: true
  }
}

export default [ clientConfig, serverConfig ];