const path = require('path')
const decompress = require('decompress')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin'); //installed via npm
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');


const sharpTarball = path.resolve(
  __dirname,
  `lambda-sharp/sharp.tar.gz`
)
const webpackDir = path.resolve(__dirname, '.webpack/')

function ExtractTarballPlugin (archive, to) {
  return {
    apply: (compiler) => {
      compiler.plugin('emit', (compilation, callback) => {
        decompress(path.resolve(archive), path.resolve(to))
          .then(() => callback())
          .catch(error => console.error('Unable to extract archive ', archive, to, error.stack))
      })
    },
  }
}

module.exports = {
  entry: slsw.lib.entries,
  // entry: './handler',
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  module: {
    rules: [
	{
        	test: /\.js$/,
		include: __dirname,
        	exclude: /node_modules/,
		use: [ 'babel-loader' ]
	},
	{
		test: /\.json$/,
		use: [ 'json-loader' ]
	}
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js', // this should match the first part of function handler in serverless.yml
  },
  externals: [nodeExternals()],
  plugins: [
//    new CleanWebpackPlugin(path.join(__dirname, '.webpack/node_modules')),
//    new webpack.optimize.OccurenceOrderPlugin(),
//    new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin({ minimize: true, sourceMap: false, warnings: false }),
    // new ExtractTarballPlugin(sharpTarball, webpackDir),
  ],
}
