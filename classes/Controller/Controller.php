<?php
/**
 * REST Likes Controller.
 *
 * @package rest-likes
 */

namespace Required\RestLikes\Controller;

use WP_Error;
use WP_REST_Response;
use WP_REST_Request;

/**
 * Base Controller class.
 */
interface Controller {

	/**
	 * Adds WordPress hooks.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_hooks();

	/**
	 * Returns a list of class names for use in the HTML markup.
	 *
	 * These can be filtered to use class names that better suit the current theme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array An array of CSS class names.
	 */
	public function get_classnames();

	/**
	 * Returns the meta key for the object type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The meta key.
	 */
	public function get_meta_key();

	/**
	 * Returns the REST API namespace for the object type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The REST API namespace.
	 */
	public function get_namespace();

	/**
	 * Registers a new REST field for the current object type.
	 *
	 * That way, clients can easily retrieve information about the like count.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_rest_field();

	/**
	 * GET callback for the likes REST field.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request Object.
	 * @return int The like count.
	 */
	public function rest_field_get_callback( WP_REST_Request $request );

	/**
	 * Returns the REST route with a placeholder for the object ID.
	 *
	 * That way, the placeholder can be easily replaced in JavaScript for example.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The REST route placeholder.
	 */
	public function get_rest_route_placeholder();

	/**
	 * Registers the API endpoint.
	 *
	 * The only allowed methods are POST (like) and DELETE (unlike).
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_rest_route();

	/**
	 * Checks permissions on the object ID.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request Object.
	 * @return true|WP_Error True if the user has permissions, false otherwise.
	 */
	public function check_permission( WP_REST_Request $request );

	/**
	 * Adds a like to an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function add_like( WP_REST_Request $request );

	/**
	 * Removes a like from an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function remove_like( WP_REST_Request $request );

	/**
	 * Adds or removes a like from meta data.
	 *
	 * Returns the new like count in both formatted and unformatted form.
	 *
	 * Negative like counts are not possible.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int  $object_id Object ID.
	 * @param bool $remove    Whether to increment or decrement the counter.
	 * @return array Response data containing the new like count, raw and formatted.
	 */
	public function handle_like( $object_id, $remove = false );

	/**
	 * Returns the like button markup.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return string Like button markup.
	 */
	public function get_like_button( $object_id );

	/**
	 * Returns the like count for an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return int Like count.
	 */
	public function get_like_count( $object_id );

	/**
	 * Returns the like count with markup.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_id );

	/**
	 * Retrieves the item's schema, conforming to JSON Schema.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema();
}
