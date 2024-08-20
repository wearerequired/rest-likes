/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<button type="button" className="rest-like-button">
				<span className="rest-like-button-label">{ __( 'Like', 'rest-likes' ) }</span>
				<span className="rest-like-count">
					<span aria-hidden="true">37</span>
					<span className="screen-reader-text">
						{
							/* translators: $s = number of likes */
							sprintf( _n( '%s likes', '%s likes', 37, 'rest-likes' ), 37 )
						}
					</span>
				</span>
			</button>
		</div>
	);
};

export default Edit;
