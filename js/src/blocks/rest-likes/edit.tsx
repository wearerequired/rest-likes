/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import './edit.css';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps( {
		className: 'my-custom-css-class',
	} );

	return <p { ...blockProps }>rest-likes</p>;
};

export default Edit;
