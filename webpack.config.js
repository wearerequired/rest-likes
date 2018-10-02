const webpack = require( 'webpack' );

const modernBrowsers = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    entry: {
        'init':           './js/src/init.js',
        'modernBrowsers': './js/src/modernBrowsers.js',
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
                use:     {
                    loader: 'babel-loader',
                },
            },
        ],
    },
};

// https://webpack.js.org/configuration/devtool/#devtool
if ( modernBrowsers.mode !== 'production' ) {
    modernBrowsers.devtool = 'source-map';
}

const legacyBrowsers = {
    ...modernBrowsers,

    entry: {
        'legacyBrowsers': './js/src/legacyBrowsers.js',
    },

    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /node_modules/,
                use:     {
                    loader:  'babel-loader',
                    options: {
                        // Don't read config from .babelrc or .browserslistrc.
                        babelrc: false,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    useBuiltIns: 'entry',
                                    targets:     [
                                        'ie >= 11',
                                        'last 1 Android versions',
                                        'last 1 ChromeAndroid versions',
                                        'last 2 Chrome versions',
                                        'last 2 Firefox versions',
                                        'last 2 Safari versions',
                                        'last 2 iOS versions',
                                        'last 2 Edge versions',
                                        'last 2 Opera versions',
                                    ]
                                }
                            ]
                        ],
                    }
                },
            },
        ],
    },
};

module.exports = [
    modernBrowsers,
    legacyBrowsers
];
