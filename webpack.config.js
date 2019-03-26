/* global __dirname */

function getConfig( { browserslistEnv } ) {
	process.env.BROWSERSLIST_ENV = browserslistEnv;

	const isModern = browserslistEnv === 'modern';

	const config = {
		mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

		entry: [
			isModern ? './js/src/modernBrowsers.js' : './js/src/legacyBrowsers.js',
		],

		// https://webpack.js.org/configuration/output/
		output: {
			path:          __dirname + '/js/',
			filename:      isModern ? './modernBrowsers.js' : './legacyBrowsers.js',
			library:       'RestLikes',
			libraryTarget: 'this',
		},

		// https://github.com/babel/babel-loader#usage
		module: {
			rules: [
				{
					test:    /\.js$/,
					exclude: /node_modules/,
					use:     {
						loader: 'babel-loader',
					},
				},
			],
		},
	};

	// https://webpack.js.org/configuration/devtool/#devtool
	if ( config.mode !== 'production' ) {
		config.devtool = 'inline-source-map';
	}

	return config;
}

module.exports = [
	getConfig( { browserslistEnv: 'modern' } ),
	getConfig( { browserslistEnv: 'legacy' } ),
];
