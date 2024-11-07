/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { useBlockProps } from '@wordpress/block-editor';

const Edit = ( { context }: { context: { postId: number; postType: string } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount ] =
		useEntityProp< number >( 'postType', context.postType, '_rest_likes', context.postId ) ?? 0;

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
