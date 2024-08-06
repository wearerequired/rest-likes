<?php
/**
 * Plugin Name: REST Likes
 * Plugin URI: https://required.com
 * Description: Like posts and comments using the REST API.
 * Version: 3.0.0-beta
 * Author: required
 * Requires at least: 6.6
 * Author URI: https://required.com
 * Text Domain: rest-likes
 * Domain Path: /languages
 * License: GPL-2.0-or-later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// phpcs:disable PSR1.Files.SideEffects

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	include __DIR__ . '/vendor/autoload.php';
}

if ( ! class_exists( 'WP_REST_Controller' ) ) {
	// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error -- Debugging info.
	trigger_error( sprintf( '%s does not exist. Update WordPress or activate the REST API plugin.', 'WP_REST_Controller' ) );

	return;
}

const REST_LIKES_PLUGIN_FILE = __FILE__;
const REST_LIKES_PLUGIN_DIR  = __DIR__;

require_once __DIR__ . '/inc/Blocks/namespace.php';

/**
 * Returns an instance of the main plugin class.
 *
 * @return \Required\RestLikes\Plugin
 */
function rest_likes() {
	static $controller = null;

	if ( null === $controller ) {
		$controller = new \Required\RestLikes\Plugin();
	}

	return $controller;
}
add_action( 'plugins_loaded', [ rest_likes(), 'add_hooks' ] );

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound

/**
 * Returns a post's like count.
 *
 * @since 1.0.0
 *
 * @param int|\WP_Post $post Optional. Post ID or object. Default global $post.
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

	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Already escaped.
	echo rest_likes()->get_like_count_html( 'post', $post->ID );
}

/**
 * Returns the post like button markup.
 *
 * @since 1.0.0
 *
 * @param int|\WP_Post $post Optional. Post ID or object. Default global $post.
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
 * @param int|\WP_Comment $comment Optional. Comment ID or object. Default global $comment.
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
	$comment = get_comment();

	if ( ! $comment ) {
		return;
	}

	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Already escaped.
	echo rest_likes()->get_like_count_html( 'comment', $comment->comment_ID );
}

/**
 * Returns the comment like button markup.
 *
 * @since 1.0.0
 *
 * @param int|\WP_Comment $comment Optional. Comment ID or object. Default global $comment.
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

// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound
