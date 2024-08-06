/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

const context = require.context( './blocks', true, /index\.(j|t)sx?$/ );

context.keys().forEach( ( modulePath ) => {
	// context() is a function which includes and returns the module.
	const block = context( modulePath );
	if ( ! block ) {
		return;
	}

	const { metadata, settings, name } = block;
	registerBlockType( { name, ...metadata }, settings );
} );
