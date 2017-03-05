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

if ( ! class_exists( 'WP_REST_Controller' ) ) {
	trigger_error( sprintf( '%s does not exist. Update WordPress or activate the REST API plugin.', 'WP_REST_Controller' ) );

	return;
}

/**
 * Load the plugin on plugins_loaded.
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
 * Get post like count.
 *
 * @param int $post_id WP_Post ID.
 *
 * @return int
 */
function get_rest_post_like_count( $post_id ) {
	return rest_likes()->get_like_count( 'post', $post_id );
}

/**
 * Get post like count markup.
 *
 * @param int $post_id WP_Post ID.
 *
 * @return string
 */
function the_rest_post_like_count( $post_id ) {
	return rest_likes()->get_like_count_html( 'post', $post_id );
}

/**
 * Get the button markup.
 *
 * @param int $post_id WP_Post ID.
 *
 * @return string|WP_Error
 */
function get_rest_post_like_button( $post_id ) {
	return rest_likes()->get_like_button( 'post', $post_id );
}
