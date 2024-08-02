/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import type { WPElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './edit.css';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 */
const ExampleEdit = (): WPElement => {
	const blockProps = useBlockProps( {
		className: 'my-custom-css-class',
	} );

	return <p { ...blockProps }>rest-likes</p>;
};

export default ExampleEdit;
