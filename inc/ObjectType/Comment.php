<?php
/**
 * REST Likes Controller for comments.
 *
 * @package rest-likes
 */

namespace Required\RestLikes\ObjectType;

use WP_Comment;
use WP_Comment_Query;
use WP_Error;
use WP_REST_Request;

class Comment implements ObjectType {
	/**
	 * The object type this controller is for.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected static $object_type = 'comment';

	public function get_name() {
		return static::$object_type;
	}

	/**
	 * Adds WordPress hooks.
	 *
	 * This includes the regular Controller hooks as well as hooks
	 * to display likes in the comments list table.
	 *
	 * @since 1.0.0
	 */
	public function add_hooks() {
		add_filter( 'manage_edit-comments_columns', [ $this, 'manage_comments_columns' ] );
		add_filter( 'manage_comments_custom_column', [ $this, 'manage_comments_custom_column' ], 10, 2 );
		add_filter( 'manage_edit-comments_sortable_columns', [ $this, 'manage_sortable_columns' ] );
		add_action( 'pre_get_comments', [ $this, 'order_by_comment_likes' ] );
	}

	/**
	 * Returns the list of comment types that likes are allowed for.
	 *
	 * @since 1.0.0
	 *
	 * @return array Allowed comment types.
	 */
	public function get_allowed_comment_types() {
		/**
		 * Filters the list of comment types likes are allowed for.
		 *
		 * Only these comment types can receive comment likes.
		 *
		 * @since 1.0.0
		 *
		 * @param array $comment_types Allowed comment types. Default 'comment'.
		 */
		return apply_filters( 'rest_likes.comment.allowed_comment_types', [ 'comment' ] );
	}

	public function get_rest_field_object_type() {
		return $this->get_name();
	}

	/**
	 * Checks whether this object ID is allowed.
	 *
	 * @param int $object_id Object ID.
	 * @return bool True if object ID is allowed, false otherwise.
	 */
	public function is_allowed_object_id( $object_id  ) {
		return $this->is_allowed_comment_type( $object_id );
	}

	/**
	 * Checks if this comment type is allowed.
	 *
	 * @since 1.0.0
	 *
	 * @param int|WP_Comment|null $comment Optional. Comment ID or object. Default is global $comment.
	 * @return bool True if comment type is allowed, false otherwise.
	 */
	protected function is_allowed_comment_type( $comment = null ) {
		return in_array( get_comment_type( $comment ), $this->get_allowed_comment_types(), true );
	}

	/**
	 * Checks permissions on the object ID.
	 *
	 * In addition to the parent check, this checks if the comment type
	 * is allowed and the comment is published.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return true|WP_Error True on success, WP_Error object on failure.
	 */
	public function check_permission( WP_REST_Request $request ) {
		if ( ! $this->is_allowed_comment_type( $request['id'] ) ) {
			return new WP_Error( 'invalid_comment_type', __( 'You are not allowed to like this comment.', 'rest-likes' ), [ 'status' => 400 ] );
		}

		if ( 'approved' !== wp_get_comment_status( $request['id'] ) ) {
			return new WP_Error( 'invalid_comment_status', __( 'You are not allowed to like this comment.', 'rest-likes' ), [ 'status' => 400 ] );
		}

		return true;
	}

	/**
	 * Filters the columns displayed in the comments list table.
	 *
	 * @since 1.0.0
	 *
	 * @param array $comments_columns An array of column names.
	 * @return array The modified array of column names.
	 */
	public function manage_comments_columns( $comments_columns ) {
		$comments_columns['likes'] = __( 'Likes', 'rest-likes' );

		return $comments_columns;
	}

	/**
	 * Displays the comment like count in the list table.
	 *
	 * @since 1.0.0
	 *
	 * @param string $column_name The name of the column to display.
	 * @param int    $comment_id  The current comment ID.
	 */
	public function manage_comments_custom_column( $column_name, $comment_id ) {
		if ( 'likes' === $column_name ) {
			echo number_format_i18n( $this->get_like_count( $comment_id ), 0 );
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
	 * Orders comments by their likes.
	 *
	 * Fires after the query variable object is created, but before the actual query is run.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Comment_Query $query The WP_Comment_Query instance (passed by reference).
	 */
	public function order_by_comment_likes( WP_Comment_Query $query ) {
		if ( is_admin() && 'likes' === $query->query_vars['orderby'] ) {
			$query->query_vars['meta_key'] = $this->meta_key;
			$query->query_vars['orderby']  = 'meta_value_num';
		}
	}
}
