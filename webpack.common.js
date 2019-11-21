const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    alias: {
      styles: path.resolve(__dirname, './src/styles/'),
    }
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader'
  //       }
  //     }
  //   ]
  // },
  module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-syntax-dynamic-import']
					}
				},
				exclude: /node_modules/
			},
			{
				test: /\.(glsl|frag|vert)$/,
				use: ['glslify-import-loader', 'raw-loader', 'glslify-loader']
			},
			{
				test: /three\/examples\/js/,
				use: 'imports-loader?THREE=three'
			},
			/*
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: 'file-loader'
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				use: 'file-loader'
			}
			*/
		]
	},

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new CleanWebpackPlugin(['public']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html'
    }),
  ]
};
