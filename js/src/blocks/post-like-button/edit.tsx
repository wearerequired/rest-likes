/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { PostType } from '@wordpress/core-data';
import { Spinner } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

const Edit = ( { context }: { context: { postId: number; postType: string } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount, setLikeCount ] = useState< number | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const [ error, setError ] = useState< string | null >( null );

	const restBase = useSelect(
		(
			select: ( store: 'core' ) => {
				getPostType: ( postType: string ) => PostType | undefined;
			}
		) => {
			if ( ! context.postType ) {
				return false;
			}
			const postTypeData = select( 'core' ).getPostType( context.postType );
			return postTypeData ? postTypeData.rest_base : null;
		},
		[ context.postType ]
	);

	useEffect( () => {
		if ( ! context.postId || false === restBase ) {
			setLikeCount( 0 );
			setIsLoading( false );
			return;
		}

		if ( ! restBase ) {
			return;
		}

		apiFetch( { path: `/wp/v2/${ restBase }/${ context.postId }` } )
			.then( ( data: { _rest_likes: number } ) => {
				setLikeCount( data._rest_likes ?? 0 );
				setIsLoading( false );
			} )
			.catch( ( fetchError: Error ) => {
				setError(
					sprintf(
						/*translators: %s: The error message */
						__( 'Post Like Button: %s', 'rest-likes' ),
						fetchError.message
					)
				);
				setIsLoading( false );
			} );
	}, [ restBase, context.postId ] );

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
