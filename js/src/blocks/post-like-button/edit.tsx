/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';
import { PostType } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

const Edit = ( { context }: { context: { postId: number; postType: string } } ): JSX.Element => {
	const blockProps = useBlockProps();
	const [ likeCount, setLikeCount ] = useState< number | null >( null );
	const restBase = useSelect(
		(
			select: ( store: 'core' ) => {
				getPostType: ( postType: string ) => PostType | undefined;
			}
		) => {
			const postTypeData = select( 'core' ).getPostType( context.postType );
			return postTypeData ? postTypeData.rest_base : null;
		},
		[ context.postType ]
	);

	useEffect( () => {
		if ( restBase ) {
			apiFetch( { path: `/wp/v2/${ restBase }/${ context.postId }` } )
				.then( ( data: { _rest_likes: number } ) => {
					setLikeCount( data._rest_likes );
				} )
				.catch( ( error: Error ) => {
					console.error( __( 'Error fetching like count:', 'rest-likes' ), error );
				} );
		}
	}, [ restBase, context.postId ] );

	if ( ! restBase || ( ! likeCount && 0 !== likeCount ) ) {
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
