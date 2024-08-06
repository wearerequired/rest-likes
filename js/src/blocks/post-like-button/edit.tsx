/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<button type="button" className="rest-like-button">
				<span className="rest-like-button-label">Like</span>
				<span className="rest-like-count">37</span>
			</button>
		</div>
	);
};

export default Edit;
