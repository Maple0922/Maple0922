const path = require('path');
const outputPath = path.resolve(__dirname,'dist/js');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'development',

	entry: './src/index.js',

	output: {
		path: outputPath,
		publicPath: '/js/',
		filename: 'bundle.js'
	},

	devServer: {
		contentBase: path.resolve(__dirname, 'dist/'),
		inline: true,
    hot: true
	},

	plugins: [
		new StyleLintPlugin({
			files: ['**/*.scss'],
			configFile: path.join(__dirname, '.stylelintrc'),
			syntax: 'scss',
			fix: true
		})
	],

	module: {
		rules: [
			{
				test: /\.scss/,
				use: ['style-loader','css-loader','sass-loader']
			},
			{
				test: /\.(jpg|png|gif|webp)$/,
				use: ['url-loader']
			}
		]
	}
};
