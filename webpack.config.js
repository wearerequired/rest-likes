const externals = {};

// Define WordPress dependencies
const wpDependencies = [
    'a11y',
    'blocks',
    'components',
    'compose',
    'date',
    'editor',
    'element',
    'hooks',
    'i18n',
    'utils',
    'data',
    'viewport',
    'core-data',
    'plugins',
    'edit-post',
];

/**
 * Given a string, returns a new string with dash separators converted to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash( string ) {
    return string.replace(
        /-([a-z])/,
        ( match, letter ) => letter.toUpperCase()
    );
}

wpDependencies.forEach( ( name ) => {
    externals[ `@wordpress/${ name }` ] = {
        this: [ 'wp', camelCaseDash( name ) ],
    };
} );

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// https://webpack.js.org/configuration/output/
const output = {
    path:          __dirname + '/js/',
        filename:      '[name].js',
        library:       'RestLikes',
        libraryTarget: 'this',
};

// https://github.com/babel/babel-loader#usage
const _module = {
    rules: [
        {
            test:    /\.js$/,
            exclude: /node_modules/,
            use:     'babel-loader',
        },
    ],
};

const frontend = {
    mode,

    entry: {
        'rest-likes': './js/src/rest-likes.js',
    },

    output,

    module: _module,
};

const editor = {
    mode,

    entry: {
        'editor': './js/src/editor.js',
    },

    output,

    module: _module,

    externals,
};

if ( frontend.mode !== 'production' ) {
    frontend.devtool = 'source-map';
}

if ( editor.mode !== 'production' ) {
    editor.devtool = 'source-map';
}

module.exports = [
    frontend,
    editor
];
