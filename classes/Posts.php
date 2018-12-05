<?php
/**
 * REST Likes Controller for posts.
 *
 * @package rest-likes
 */

namespace Required\RestLikes;

use WP_Error;
use WP_Query;
use WP_Post;
use WP_REST_Request;

/**
 * Posts Controller class.
 *
 * @since 1.0.0
 */
class Posts extends Controller {
	/**
	 * The object type this controller is for.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected static $object_type = 'post';

	/**
	 * Adds WordPress hooks.
	 *
	 * This includes the regular Controller hooks as well as hooks
	 * to display likes in the posts list table.
	 *
	 * @since 1.0.0
	 */
	public function add_hooks() {
		parent::add_hooks();

		add_filter( 'manage_posts_columns', [ $this, 'manage_posts_columns' ], 10, 2 );
		add_filter( 'manage_posts_custom_column', [ $this, 'manage_posts_custom_column' ], 10, 2 );
		add_action( 'pre_get_posts', [ $this, 'order_by_post_likes' ] );

		foreach ( $this->get_allowed_post_types() as $post_type ) {
			add_filter( "manage_edit-{$post_type}_sortable_columns", [ $this, 'manage_sortable_columns' ] );
		}
	}

	/**
	 * Returns the list of post types that likes are allowed for.
	 *
	 * @since 1.0.0
	 *
	 * @return array Allowed post types.
	 */
	public function get_allowed_post_types() {
		/**
		 * Filters the list of post types likes are allowed for.
		 *
		 * Only these post types can receive post likes.
		 *
		 * @since 1.0.0
		 *
		 * @param array $post_types Allowed post types. Default 'post' and 'page'.
		 */
		return apply_filters( 'rest_likes.post.allowed_post_types', [ 'post', 'page' ] );
	}

	/**
	 * Returns the post types that the REST field will be registered for.
	 *
	 * @since 1.0.0
	 *
	 * @return array Enabled post types.
	 */
	protected function get_rest_field_object_type() {
		return $this->get_allowed_post_types();
	}

	/**
	 * Checks permissions on the object ID.
	 *
	 * In addition to the parent check, this checks if the post type
	 * is allowed and the post is published.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return true|WP_Error True on success, WP_Error object on failure.
	 */
	public function check_permission( WP_REST_Request $request ) {
		if ( ! $this->is_allowed_post_type( $request['id'] ) ) {
			return new WP_Error( 'invalid_post_type', __( 'You are not allowed to like this post.', 'rest-likes' ), [ 'status' => 400 ] );
		}

		$post_type = get_post_type_object( get_post_type( $request['id'] ) );

		// Is the post readable?
		if ( ! $post_type || ( 'publish' !== get_post_status( $request['id'] ) && ! current_user_can( $post_type->cap->read_post, $request['id'] ) ) ) {
			return new WP_Error( 'invalid_post', __( 'You are not allowed to like this post.', 'rest-likes' ), [ 'status' => 400 ] );
		}

		return parent::check_permission( $request );
	}

	/**
	 * Checks if this post type is allowed.
	 *
	 * @since 1.0.0
	 *
	 * @param int|WP_Post|null $post Optional. Post ID or post object. Default is global $post.
	 *
	 * @return bool True if post type is allowed, false otherwise.
	 */
	public function is_allowed_post_type( $post = null ) {
		return in_array( get_post_type( $post ), $this->get_allowed_post_types(), true );
	}

	/**
	 * Returns the like button markup.
	 *
	 * @since 1.0.0
	 *
	 * @param int $object_id Post ID.
	 * @return string Like button markup. Empty string if post type is not allowed.
	 */
	public function get_like_button( $object_id ) {
		if ( ! $this->is_allowed_post_type( $object_id ) ) {
			return '';
		}

		return parent::get_like_button( $object_id );
	}

	/**
	 * Returns the like count for a post.
	 *
	 * @since 1.0.0
	 *
	 * @param int $post_id Post ID.
	 * @return int Like count. Will be zero if post type is not allowed.
	 */
	public function get_like_count( $post_id ) {
		if ( ! $this->is_allowed_post_type( $post_id ) ) {
			return 0;
		}

		return parent::get_like_count( $post_id );
	}

	/**
	 * Returns the like count markup.
	 *
	 * @since 1.0.0
	 *
	 * @param int $post_id Post ID.
	 * @return string Like count markup. Empty string if post type is not allowed.
	 */
	public function get_like_count_html( $post_id ) {
		if ( ! $this->is_allowed_post_type( $post_id ) ) {
			return '';
		}

		return parent::get_like_count_html( $post_id );
	}

	/**
	 * Filters the columns displayed in the Posts list table.
	 *
	 * @since 1.0.0
	 *
	 * @param array  $posts_columns An array of column names.
	 * @param string $post_type     The post type slug.
	 * @return array The modified array of column names.
	 */
	public function manage_posts_columns( $posts_columns, $post_type ) {
		if ( ! in_array( $post_type, $this->get_allowed_post_types(), true ) ) {
			return $posts_columns;
		}

		$posts_columns['likes'] = __( 'Likes', 'rest-likes' );

		return $posts_columns;
	}

	/**
	 * Displays the post like count in the list table.
	 *
	 * @since 1.0.0
	 *
	 * @param string $column_name The name of the column to display.
	 * @param int    $post_id     The current post ID.
	 */
	public function manage_posts_custom_column( $column_name, $post_id ) {
		if ( 'likes' === $column_name ) {
			$likes = $this->get_like_count( $post_id );

			echo is_wp_error( $likes ) ? 0 : number_format_i18n( $likes, 0 );
		}
	}

	/**
	 * Filters the list table sortable columns for a specific screen.
	 *
	 * @since 1.0.0
	 *
	 * @param array $sortable_columns An array of sortable columns.
	 * @return array The modified array of sortable columns.
	 */
	public function manage_sortable_columns( $sortable_columns ) {
		$sortable_columns['likes'] = 'likes';

		return $sortable_columns;
	}

	/**
	 * Orders posts by their likes.
	 *
	 * Fires after the query variable object is created, but before the actual query is run.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Query $query The WP_Query instance (passed by reference).
	 */
	public function order_by_post_likes( WP_Query $query ) {
		if ( is_admin() && $query->is_main_query() && 'likes' === $query->get( 'orderby' ) ) {
			$query->set( 'meta_key', $this->get_meta_key() );
			$query->set( 'orderby', 'meta_value_num' );
		}
	}
}
