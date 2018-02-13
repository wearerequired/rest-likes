<?php
/**
 * Separate init file that isn't compatible with PHP 5.3 or lower.
 *
 * @package Required\RestLikes
 */

/**
 * Returns an instance of the main plugin class.
 *
 * @return Required\inc\Plugin
 */
function rest_likes() {
	static $controller = null;

	if ( null === $controller ) {
		$controller = new \Required\inc\Plugin();
	}

	return $controller;
}

/**
 * Returns a post's like count.
 *
 * @since 1.0.0
 *
 * @param int|WP_Post $post Optional. Post ID or object. Default global $post.
 *
 * @return int The post like count.
 */
function get_rest_post_like_count( $post = null ) {
	$post = get_post( $post );

	if ( ! $post ) {
		return 0;
	}

	return rest_likes()->get_like_count( 'post', $post->ID );
}

/**
 * Prints the post like count markup.
 *
 * @since 1.0.0
 *
 * @return void
 */
function the_rest_post_like_count() {
	$post = get_post();

	if ( ! $post ) {
		return;
	}

	echo rest_likes()->get_like_count_html( 'post', $post->ID );
}

/**
 * Returns the post like button markup.
 *
 * @since 1.0.0
 *
 * @param int|WP_Post $post Optional. Post ID or object. Default global $post.
 * @return string The like button markup.
 */
function get_rest_post_like_button( $post = null ) {
	$post = get_post( $post );

	if ( ! $post ) {
		return '';
	}

	return rest_likes()->get_like_button( 'post', $post->ID );
}

/**
 * Prints the post like button markup.
 *
 * @since 1.0.0
 *
 * @return void
 */
function the_rest_post_like_button() {
	echo get_rest_post_like_button();
}

/**
 * Returns a comments's like count.
 *
 * @since 1.0.0
 *
 * @param int|WP_Comment $comment Optional. Comment ID or object. Default global $comment.
 * @return int The comment like count.
 */
function get_rest_comment_like_count( $comment = null ) {
	$comment = get_comment( $comment );

	if ( ! $comment ) {
		return 0;
	}

	return rest_likes()->get_like_count( 'comment', $comment->comment_ID );
}

/**
 * Prints the comment like count markup.
 *
 * @since 1.0.0
 *
 * @return void
 */
function the_rest_comment_like_count() {
	$comment = get_comment( $comment );

	if ( ! $comment ) {
		return;
	}

	echo rest_likes()->get_like_count_html( 'comment', $comment->comment_ID );
}

/**
 * Returns the comment like button markup.
 *
 * @since 1.0.0
 *
 * @param int|WP_Comment $comment Optional. Comment ID or object. Default global $comment.
 * @return string The like button markup.
 */
function get_rest_comment_like_button( $comment = null ) {
	$comment = get_comment( $comment );

	if ( ! $comment ) {
		return '';
	}

	return rest_likes()->get_like_button( 'comment', $comment->comment_ID );
}

/**
 * Prints the comment like button markup.
 *
 * @since 1.0.0
 *
 * @return void
 */
function the_rest_comment_like_button() {
	echo get_rest_comment_like_button();
}
