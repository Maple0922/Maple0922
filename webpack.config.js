const path = require('path');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'development',

	entry: './src/js/index.js',

	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, 'dist/js')
	},

	plugins: [
		new webpack.ProgressPlugin(),
		new MiniCssExtractPlugin({ filename: 'main.[chunkhash].css' }),
		new StyleLintPlugin({
      files: ['**/*.scss'],
      configFile: path.join(__dirname, '.stylelintrc'),
      syntax: 'scss',
      fix: true
    }),
		new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
	],

	module: {
		rules: [
			{
				test: /.(scss|css)$/,

				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',

						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',

						options: {
							sourceMap: true
						}
					}
				]
			}
		]
	},

	optimization: {
		minimizer: [new TerserPlugin()],

		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	}
};
