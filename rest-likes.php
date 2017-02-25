<?php
/**
 * @wordpress-plugin
 *
 * Plugin Name: REST Likes
 * Plugin URI:  https://required.com
 * Description: Like posts and comments using the REST API.
 * Version:     1.0.0
 * Author:      Silvan Hagen
 * Author URI:  https://required.com
 * Text Domain: rest-likes
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package rest-likes
 */

if ( file_exists( dirname( __FILE__ ) . '/vendor/autoload.php' ) ) {
	include( dirname( __FILE__ ) . '/vendor/autoload.php' );
}

/**
 * Returns an instance of the main plugin class.
 *
 * @return Required\RestLikes\Plugin
 */
function rest_likes() {
	static $controller = null;

	if ( null === $controller ) {
		$controller = new \Required\RestLikes\Plugin();
	}

	return $controller;
}

add_action( 'plugins_loaded', [ rest_likes(), 'add_hooks' ] );

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
