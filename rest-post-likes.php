<?php
/**
 * @wordpress-plugin
 * Plugin Name: REST Post Likes
 * Plugin URI:  https://required.ch
 * Description: Post Likes using the WP REST API.
 * Version:     1.0.0
 * Author:      Silvan Hagen
 * Author URI:  https://required.ch
 * Text Domain: rest-post-likes
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package rest-post-likes
 */

if ( file_exists( dirname( __FILE__ ) . '/classes/Controller.php' ) ) {
	include( dirname( __FILE__ ) . '/classes/Controller.php' );
}

/**
 * Load the plugin on plugins_loaded.
 *
 * @return Required\RestPostLikes\Controller
 */
function rest_post_likes() {
	static $controller = null;

	if ( null === $controller ) {
		$controller = new \Required\RestPostLikes\Controller();
	}

	return $controller;
}
add_action( 'plugins_loaded', 'rest_post_likes' );

/**
 * Get post like count.
 *
 * @param int $post_id WP_Post ID.
 *
 * @return int
 */
function get_rest_post_like_count( $post_id ) {
	return rest_post_likes()->get_post_like_count( absint( $post_id ) );
}

/**
 * Get or display the like count.
 *
 * @param int   $post_id WP_Post ID.
 * @param array $args Optional args to customize the count markup.
 *
 * @return string
 */
function the_rest_post_like_count( $post_id, $args = [] ) {
	return rest_post_likes()->the_post_like_count( $post_id, $args );
}

/**
 * Get the button markup.
 *
 * @param int   $post_id WP_Post ID.
 * @param array $args Optional args to customize the button markup.
 *
 * @return string|WP_Error
 */
function get_rest_post_like_button( $post_id, $args = [] ) {
	$button = rest_post_likes()->get_post_like_button( $post_id, $args );

	return is_wp_error( $button ) ? '' : $button;
}

/**
 * Get allowed post types.
 *
 * @return array
 */
function get_rest_post_like_allowed_post_types() {
	return (array) rest_post_likes()->allowed_post_types;
}
