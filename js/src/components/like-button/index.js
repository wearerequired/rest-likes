import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

class LikeButton extends Component {
    render() {
        const { count = 0, countFormatted = 0, hasBeenLiked = false, displayLikeCount = true, postId } = this.props;

        return (
            <button
                className="rest-like-button"
                data-type="post"
                data-id={postId}
                data-rest-like-button
            >
                <span className="rest-like-button-label">
                    {hasBeenLiked ? __( 'Unlike', 'rest-likes' ) : __( 'Like', 'rest-likes' )}
                </span>
                {
                    displayLikeCount && <span
                        className="rest-like-count"
                        data-type="post"
                        data-id={postId}
                        data-likes={count}
                    >
                        {countFormatted}
                    </span>
                }
            </button>
        )
    }
}

export default withSelect( ( select ) => {
    const { getCurrentPostId } = select( 'core/editor' );

    return {
        postId: getCurrentPostId(),
    };
} )( LikeButton );
