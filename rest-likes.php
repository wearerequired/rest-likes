<?php
/**
 * @wordpress-plugin
 *
 * Plugin Name: REST Likes
 * Plugin URI:  https://required.com
 * Description: Like posts and comments using the REST API.
 * Version:     1.0.2
 * Author:      required
 * Author URI:  https://required.com
 * Text Domain: rest-likes
 * Domain Path: /languages
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package rest-likes
 */

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	include __DIR__ . '/vendor/autoload.php';
}

if ( ! class_exists( '\Required\RestLikes\Plugin' ) ) {
	/* translators: %s: plugin class name */
	trigger_error( sprintf( __( "%s does not exist. Check Composer's autoloader.", 'rest-likes' ), '\Required\RestLikes\Plugin' ), E_USER_WARNING );

	return;
}

$requirements_check = new WP_Requirements_Check( array(
	'title' => 'User Feedback',
	'php'   => '5.6',
	'wp'    => '4.7',
	'file'  => __FILE__,
) );

if ( $requirements_check->passes() ) {
	include dirname( __FILE__ ) . '/init.php';

	add_action( 'plugins_loaded', [ rest_likes(), 'init' ] );
}

unset( $requirements_check );
