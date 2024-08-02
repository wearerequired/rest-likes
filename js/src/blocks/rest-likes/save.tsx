/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import type { WPElement } from '@wordpress/element';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 */
export default function save(): WPElement {
	const blockProps = useBlockProps.save( {
		className: 'my-custom-css-class',
	} );

	return <p { ...blockProps }>Hello from the saved content!</p>;
}
