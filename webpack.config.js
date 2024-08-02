const { basename, dirname, resolve } = require( 'path' );
const defaultConfig = require( './node_modules/@wordpress/scripts/config/webpack.config' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' ); // eslint-disable-line import/no-extraneous-dependencies -- Part of @wordpress/scripts.

module.exports = {
	// https://github.com/WordPress/gutenberg/blob/master/packages/scripts/config/webpack.config.js
	...defaultConfig,

	externals: {
		jquery: 'jQuery',
	},

	// https://webpack.js.org/configuration/entry-context/#context
	context: resolve( __dirname, 'js/src' ),

	// https://webpack.js.org/configuration/entry-context/#entry
	entry: {
		blocks: './blocks.ts',
		'rest-likes': './index.js',
	},

	// https://webpack.js.org/configuration/output/
	output: {
		...defaultConfig.output,
		uniqueName: '@wearerequired/rest-likes',
		path: resolve( __dirname, 'js/dist' ),
		filename: '[name].js',
	},

	plugins: [
		...defaultConfig.plugins,
		new CopyWebpackPlugin( {
			patterns: [
				{
					// Copy block.json to build folder with name of block as filename
					from: 'blocks/**/block.json',
					to( { absoluteFilename } ) {
						// Get the block folder name
						const blockName = basename( dirname( absoluteFilename ) );
						// Output with original extension (.json)
						return `./${ blockName }-block[ext]`;
					},
					noErrorOnMissing: true,
				},
			],
		} ),
	],
};
