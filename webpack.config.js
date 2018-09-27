const webpack = require( 'webpack' );

const config = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
        'rest-likes': './js/src/rest-likes.js',
    },

    // https://webpack.js.org/configuration/output/
    output: {
        path:          __dirname + '/js/',
        filename:      '[name].js',
        library:       'RestLikes',
        libraryTarget: 'this',
    },

    // https://github.com/babel/babel-loader#usage
    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /node_modules/,
                use:     'babel-loader',
            },
        ],
    },
};

// https://webpack.js.org/configuration/devtool/#devtool
if ( config.mode !== 'production' ) {
    config.devtool = 'source-map';
}

module.exports = config;
