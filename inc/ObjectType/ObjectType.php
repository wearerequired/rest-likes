<?php
/**
 * ObjectType interface.
 *
 * @package rest-likes
 */

namespace Required\RestLikes\ObjectType;

use WP_REST_Request;

interface ObjectType {
	public function get_name();

	public function get_meta_key();

	public function get_rest_field_object_type();

	public function add_hooks();

	public function check_permission( WP_REST_Request $request );

	public function is_allowed_object_id( $object_id );

	public function get_like_count( $object_id );
}
