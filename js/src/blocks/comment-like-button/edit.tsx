/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useBlockProps } from '@wordpress/block-editor';

const Edit = ( { context }: { context: { commentId: number } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount ] = useEntityProp< number >(
		'root',
		'comment',
		'_rest_likes',
		context.commentId
	);

	if ( ! likeCount && 0 !== likeCount ) {
		return <Spinner />;
	}

	return (
		<div { ...blockProps }>
			<button type="button" className="rest-like-button">
				<span className="rest-like-button-label">{ __( 'Like', 'rest-likes' ) }</span>
				<span className="rest-like-count">
					<span aria-hidden="true">{ likeCount }</span>
					<span className="screen-reader-text">
						{ sprintf(
							/* translators: %s: number of likes */
							_n( '%s likes', '%s likes', likeCount, 'rest-likes' ),
							likeCount
						) }
					</span>
				</span>
			</button>
		</div>
	);
};

export default Edit;
