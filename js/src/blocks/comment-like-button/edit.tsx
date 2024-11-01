/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

const Edit = ( { context }: { context: { commentId: number } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount, setLikeCount ] = useState< number | null >( null );

	if ( context.commentId ) {
		useEffect( () => {
			apiFetch( { path: `/wp/v2/comments/${ context.commentId }` } )
				.then( ( data: { _rest_likes: number } ) => {
					setLikeCount( data._rest_likes );
				} )
				.catch( ( error: Error ) => {
					console.error( __( 'Error fetching like count:', 'rest-likes' ), error );
				} );
		}, [ context.commentId ] );

		if ( ! likeCount && 0 !== likeCount ) {
			return <Spinner />;
		}
	}

	if ( ! context.commentId ) {
		setLikeCount( null );
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
