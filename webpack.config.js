const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

require("dotenv").config();

const htmlPlugin = new HtmlWebpackPlugin({
  template: "./src/index.html",
  filename: "index.html"
});

const cssPlugin = new MiniCSSExtractPlugin({
  filename: "./assets/css/styles.css"
});

const dotEnvPlugin = new Dotenv();
const webpackEnvPlugins = new webpack.DefinePlugin({
  "process.env.PORTIS_KEY": JSON.stringify(process.env.PORTIS_KEY),
  "process.env.DATABASE_USER": JSON.stringify(process.env.DATABASE_USER),
  "process.env.DATABASE_PASSWORD": JSON.stringify(
    process.env.DATABASE_PASSWORD
  ),
  "process.env.ENVIRONMENT": JSON.stringify(process.env.ENVIRONMENT)
});

module.exports = {
  devtool: "eval",
  entry: "./src/App.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [
      ".js",
      ".jsx",
      ".json",
      ".css",
      ".png",
      ".jpeg",
      ".jpg",
      ".gif",
      ".svg"
    ]
  },
  node: {
    net: "empty",
    fs: "empty"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          "babel-loader",
          {
            loader: "eslint-loader",
            options: {
              useEslintrc: true
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  plugins: [htmlPlugin, cssPlugin, dotEnvPlugin, webpackEnvPlugins]
};
