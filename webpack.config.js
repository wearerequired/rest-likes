const path = require( 'path' );
const TerserPlugin = require( 'terser-webpack-plugin' );

const isProduction = process.env.NODE_ENV === 'production';

module.exports = [
	{
		mode: isProduction ? 'production' : 'development',
		devtool: isProduction ? undefined : 'inline-source-map',

		externals: {
			jquery: 'jQuery',
		},

		// https://webpack.js.org/configuration/entry-context/#context
		context: path.resolve( __dirname, 'js/src' ),

		entry: {
			'rest-likes': './index.js',
		},

		// https://webpack.js.org/configuration/optimization/#optimization-runtimechunk
		optimization: {
			minimizer: [
				new TerserPlugin( {
					parallel: true,
					extractComments: false,
					terserOptions: {
						output: {
							comments: false,
						},
						compress: {
							passes: 2,
						},
					},
				} ),
			],
		},

		// https://webpack.js.org/configuration/output/
		output: {
			path: path.resolve( __dirname, 'js/dist' ),
			uniqueName: '@wearerequired/rest-likes',
			filename: '[name].js',
			clean: true, // Clean the output directory before emit.
		},

		// https://github.com/babel/babel-loader#usage
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: 'babel-loader',
				},
			],
		},
	},
];
