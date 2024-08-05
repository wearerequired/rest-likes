/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import './edit.css';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps();

	return <div { ...blockProps }>❤️</div>;
};

export default Edit;
