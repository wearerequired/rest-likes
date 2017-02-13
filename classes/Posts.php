<?php
/**
 * Rest Post Likes Controller.
 *
 * @package rest-post-likes
 */

namespace Required\RestPostLikes;

use WP_Error;
use WP_Query;

/**
 * Class Controller
 *
 * @package RestPostLikes
 */
class Posts extends Controller {
	/**
	 * REST field & meta key value.
	 *
	 * @var string
	 */
	protected $meta_key = 'rest_post_likes';

	/**
	 * The object type this controller is for.
	 *
	 * @var string
	 */
	protected static $object_type = 'post';

	/**
	 * Add hooks to WP.
	 */
	public function add_hooks() {
		add_filter( 'manage_posts_columns', [ $this, 'manage_posts_columns' ], 10, 2 );
		add_filter( 'manage_posts_custom_column', [ $this, 'manage_posts_custom_column' ], 10, 2 );
		add_action( 'pre_get_posts', [ $this, 'order_by_post_likes' ] );

		foreach ( $this->get_allowed_post_types() as $post_type ) {
			add_filter( "manage_edit-{$post_type}_sortable_columns", [ $this, 'manage_sortable_columns' ] );
		}
	}

	public function get_allowed_post_types() {
		/**
		 * Filter the allowed post types.
		 *
		 * Only these post types can receive post likes.
		 *
		 * @param array $post_types Allowed post types. Default 'post' and 'page'.
		 */
		return apply_filters( 'rest_likes.post.allowed_post_types', [ 'post', 'page' ] );
	}

	public function get_rest_field_object_type() {
		return $this->get_allowed_post_types();
	}

	/**
	 * Check permissions on the object id.
	 *
	 * @param \WP_REST_Request $request Request Object.
	 *
	 * @return bool|WP_Error
	 */
	public function check_permission( \WP_REST_Request $request ) {
		if ( ! $this->is_allowed_post_type( $request['id'] ) ) {
			return new WP_Error( 'invalid_post_type', 'You are not allowed to like this post.', array( 'status' => 400 ) );
		}

		if ( 'publish' !== get_post_status( $request['id'] ) ) {
			return new WP_Error( 'invalid-post-status', 'You are not allowed to like this post', array( 'status' => 400 ) );
		}

		return parent::check_permission( $request );
	}

	/**
	 * Check if this post type is allowed.
	 *
	 * @param int|\WP_Post|null $post Optional. Post ID or post object. Default is global $post.
	 *
	 * @return bool True if post type is allowed, false otherwise.
	 */
	public function is_allowed_post_type( $post = null ) {
		return in_array( get_post_type( $post ), $this->get_allowed_post_types(), true );
	}

	/**
	 * Returns the like button markup.
	 *
	 * @param int $object_id Post ID.
	 *
	 * @return string
	 */
	public function get_like_button( $object_id ) {
		if ( ! $this->is_allowed_post_type( $object_id ) ) {
			return '';
		}

		return parent::get_like_button( $object_id );
	}

	/**
	 * Get like count for a post.
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return int
	 */
	public function get_like_count( $post_id ) {
		if ( ! $this->is_allowed_post_type( $post_id ) ) {
			return 0;
		}

		return parent::get_like_count( $post_id );
	}

	/**
	 * Get post like count with markup.
	 *
	 * @param int   $post_id Post ID.
	 *
	 * @return string
	 */
	public function get_like_count_html( $post_id  ) {
		if ( ! $this->is_allowed_post_type( $post_id ) ) {
			return '';
		}

		return parent::get_like_count_html( $post_id );
	}

	/**
	 * Filters the columns displayed in the Posts list table.
	 *
	 * @param array  $posts_columns An array of column names.
	 * @param string $post_type     The post type slug.
	 * @return array The modified array of column names.
	 */
	public function manage_posts_columns( $posts_columns, $post_type  ) {
		if ( ! in_array( $post_type, $this->get_allowed_post_types(), true ) ) {
			return $posts_columns;
		}

		$posts_columns['likes'] = __( 'Likes', 'rest-post-likes' );

		return $posts_columns;
	}

	/**
	 * Displays the post like count in the list table.
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
	 * @param array $sortable_columns An array of sortable columns.
	 *
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
	 * @param WP_Query $query The WP_Query instance (passed by reference).
	 */
	public function order_by_post_likes( WP_Query $query ) {
		if ( is_admin() && $query->is_main_query() && 'likes' === $query->get( 'orderby' ) ) {
			$query->set( 'meta_key', $this->get_meta_key() );
			$query->set( 'orderby', 'meta_value_num' );
		}
	}
}
