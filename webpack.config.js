const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: "development",
  //mode: "production",
  entry: './renderer.js',
  output: {
    path: path.join(__dirname, 'dest'),
    publicPath: 'dest/',
    filename: 'bundle.js'
  },
  devtool: 'source-map'
  //devtool: 'cheap-module-source-map'
  //devtool: 'inline-cheap-source-map'
}
