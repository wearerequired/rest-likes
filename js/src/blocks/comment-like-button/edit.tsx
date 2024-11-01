/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';

const Edit = ( { context }: { context: { commentId: number } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount, setLikeCount ] = useState< number | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		if ( ! context.commentId ) {
			setLikeCount( 0 );
			setIsLoading( false );
			return;
		}
		apiFetch( { path: `/wp/v2/comments/${ context.commentId }` } )
			.then( ( data: { _rest_likes: number } ) => {
				setLikeCount( data._rest_likes ?? 0 );
				setIsLoading( false );
			} )
			.catch( ( fetchError: Error ) => {
				setError(
					sprintf(
						/*translators: %s: The error message */
						__( 'Comment Like Button: %s', 'rest-likes' ),
						fetchError.message
					)
				);
				setIsLoading( false );
			} );
	}, [ context.commentId ] );

	if ( isLoading ) {
		return <Spinner />;
	}

	if ( error ) {
		return <div { ...blockProps }>{ error }</div>;
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
