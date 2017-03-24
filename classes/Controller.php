<?php
/**
 * REST Likes Controller.
 *
 * @package rest-likes
 */

namespace Required\RestLikes;

use WP_Error;
use WP_REST_Server;
use WP_REST_Response;
use WP_REST_Request;
use WP_REST_Controller;

/**
 * Base Controller class.
 */
abstract class Controller extends WP_REST_Controller {
	/**
	 * Object type this controller is for.
	 *
	 * Needs to be overridden by sub class.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @var string
	 */
	protected static $object_type;

	/**
	 * REST field & meta key value.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @var string
	 */
	protected $meta_key = 'rest_likes';

	/**
	 * REST namespace.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @var string
	 */
	protected $namespace = 'rest-likes';

	/**
	 * REST route version.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @var int
	 */
	protected $version = 1;

	/**
	 * Adds WordPress hooks.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_hooks() {
		add_action( 'rest_api_init', [ $this, 'add_rest_route' ] );
		add_action( 'rest_api_init', [ $this, 'add_rest_field' ] );
		add_action( 'rest_pre_dispatch', [ $this, 'rest_pre_dispatch' ], 10, 3 );
	}

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
	public function get_classnames() {
		/**
		 * Filters the CSS class names for a given object type.
		 *
		 * @since 1.0.0
		 *
		 * @param array  $classnames  The list of CSS class names.
		 * @param string $object_type The object type the class names are for.
		 */
		return apply_filters( 'rest_likes.classnames', [
			'count'      => 'rest-like-count',
			'button'     => 'rest-like-button',
			'label'      => 'rest-like-button-label',
			'liked'      => 'has-like',
			'processing' => 'rest-like-processing',
		], $this->get_object_type() );
	}

	/**
	 * Returns the meta key for the object type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The meta key.
	 */
	public function get_meta_key() {
		return $this->meta_key;
	}

	/**
	 * Returns the REST API namespace for the object type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The REST API namespace.
	 */
	public function get_namespace() {
		return $this->namespace . '/v' . $this->version;
	}

	/**
	 * Returns the object type for use when registering the REST fields.
	 *
	 * Can be either a string or an array of (sub) object types (e.g. post types).
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return string The object type the REST field should be registered for.
	 */
	protected function get_rest_field_object_type() {
		return $this->get_object_type();
	}

	/**
	 * Registers a new REST field for the current object type.
	 *
	 * That way, clients can easily retrieve information about the like count.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_rest_field() {
		register_rest_field( $this->get_rest_field_object_type(), $this->get_meta_key(), [
			'get_callback' => [ $this, 'rest_field_get_callback' ],
			'schema'       => [
				'type'        => 'integer',
				'description' => 'The number of likes the object has.',
				'context'     => [ 'view', 'edit', 'embed' ],
			],
		] );
	}

	/**
	 * GET callback for the likes REST field.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request Object.
	 * @return int The like count.
	 */
	public function rest_field_get_callback( WP_REST_Request $request ) {
		return $this->get_like_count( $request['id'] );
	}

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
	public function get_rest_route_placeholder() {
		return sprintf( '/%ss/%%s/like', $this->get_object_type() );
	}

	/**
	 * Returns the REST route for use when registering it.
	 *
	 * @see Controller::add_rest_route()
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return string The REST route.
	 */
	protected function get_rest_route() {
		return sprintf( $this->get_rest_route_placeholder(), '(?P<id>[\d]+)' );
	}

	/**
	 * Registers the API endpoint.
	 *
	 * The only allowed methods are POST (like) and DELETE (unlike).
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_rest_route() {
		register_rest_route( $this->get_namespace(), $this->get_rest_route(), [
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'args'                => [
					'id' => [
						'sanitize_callback' => '\\absint',
						'required'          => true,
					],
				],
				'permission_callback' => [ $this, 'check_permission' ],
				'callback'            => [ $this, 'add_like' ],
			],
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'args'                => [
					'id' => [
						'sanitize_callback' => '\\absint',
						'required'          => true,
					],
				],
				'permission_callback' => [ $this, 'check_permission' ],
				'callback'            => [ $this, 'remove_like' ],
			],
		] );
	}

	/**
	 * Checks permissions on the object ID.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request Object.
	 * @return true|WP_Error True if the user has permissions, false otherwise.
	 */
	public function check_permission( WP_REST_Request $request ) {
		if ( $this->transient_exists( $request ) ) {
			return new WP_Error( 'invalid_action', __( 'You cannot like the same thing all day long', 'rest-likes' ), [ 'status' => 400 ] );
		}

		return true;
	}

	/**
	 * Checks if there's already a like for an object from a given IP address.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return True if the user has already liked this object, false otherwise.
	 */
	protected function transient_exists( WP_REST_Request $request ) {
		$ip_address = isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
		$transient  = sprintf(
			'%s_like_%s',
			$this->get_object_type(),
			md5( $ip_address . $request['id'] . $request->get_method() )
		);

		$value = get_transient( $transient );

		if ( ! $value ) {
			// Todo: consider moving to a separate method to keep it side-effect free.
			set_transient( $transient, 1, 2 * MINUTE_IN_SECONDS );

			return false;
		}

		return true;
	}

	/**
	 * Adds a like to an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function add_like( $request ) {
		return new WP_REST_Response( $this->handle_like( $request['id'], false ), 201 );
	}

	/**
	 * Removes a like from an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function remove_like( $request ) {
		return new WP_REST_Response( $this->handle_like( $request['id'], true ), 200 );
	}

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
	public function handle_like( $object_id, $remove = false ) {
		$likes = $this->get_like_count( $object_id );
		$likes = $remove ? -- $likes : ++ $likes;
		$likes = max( $likes, 0 );

		update_metadata( $this->get_object_type(), $object_id, $this->get_meta_key(), $likes );

		return [
			'count'          => $likes,
			'countFormatted' => number_format_i18n( $likes ),
		];
	}

	/**
	 * Returns the like button markup.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return string Like button markup.
	 */
	public function get_like_button( $object_id ) {
		$object_id = absint( $object_id );

		/**
		 * Filters the text displayed inside the like button.
		 *
		 * @since 1.0.0
		 *
		 * @param string $button_text The button text. Default 'Like'.
		 * @param string $object_type The object type this button is for.
		 */
		$button_text = apply_filters( 'rest_likes.button_text.like', _x( 'Like', 'verb', 'rest-likes' ), $this->get_object_type() );

		$button = sprintf(
			'<button class="%1$s" data-type="%2$s" data-id="%3$d" data-rest-like-button>%4$s %5$s</button>',
			esc_attr( $this->get_classnames()['button'] ),
			esc_attr( $this->get_object_type() ),
			$object_id,
			sprintf( '<span class="%1$s">%2$s</span>', $this->get_classnames()['label'], $button_text ),
			$this->get_like_count_html( $object_id )
		);

		/**
		 * Filters the like button markup.
		 *
		 * @since 1.0.0
		 *
		 * @param string $button      The button markup.
		 * @param int    $object_id   The object ID.
		 * @param string $object_Type The object type.
		 */
		return apply_filters( 'rest_likes.button_markup', $button, $object_id, $this->get_object_type() );
	}

	/**
	 * Returns the like count for an object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return int Like count.
	 */
	public function get_like_count( $object_id ) {
		return absint( get_metadata( $this->get_object_type(), $object_id, $this->get_meta_key(), true ) );
	}

	/**
	 * Returns the like count with markup.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $object_id Object ID.
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_id ) {
		$likes = $this->get_like_count( $object_id );

		return sprintf( apply_filters( 'rest_likes.count_markup', '<span class="%1$s" data-type="%2$s" data-id="%3$d" data-likes="%4$d">%5$s</span>' ),
			esc_attr( $this->get_classnames()['count'] ),
			esc_attr( $this->get_object_type() ),
			absint( $object_id ),
			esc_attr( $likes ),
			esc_html( number_format_i18n( $likes ) )
		);
	}

	/**
	 * Workaround for non-working DELETE requests.
	 *
	 * @link https://github.com/wearerequired/rest-likes/issues/5
	 *
	 * @todo Consider moving out of the plugin as it seems to be a server-specific issue.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param mixed           $result   Response to replace the requested version with. Can be anything
	 *                                  a normal endpoint can return, or null to not hijack the request.
	 * @param WP_REST_Server  $server   Server instance.
	 * @param WP_REST_Request $request  Request used to generate the response.
	 * @return mixed|WP_REST_Response The modified response.
	 */
	public function rest_pre_dispatch( $result, $server, $request ) {
		remove_filter( current_filter(), __FUNCTION__ );

		if (
			WP_REST_Server::READABLE === $request->get_method() &&
			preg_match( '@^/' . $this->get_namespace() . $this->get_rest_route() . '$@i', $request->get_route() )
		) {
			$request->set_method( WP_REST_Server::DELETABLE );

			return $server->dispatch( $request );
		}

		return $result;
	}

	/**
	 * Retrieves the item's schema, conforming to JSON Schema.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		$schema = [
			'$schema'    => 'http://json-schema.org/schema#',
			'title'      => static::$object_type,
			'type'       => 'object',
			'properties' => [
				'count'          => [
					'description' => __( 'Like count', 'rest-likes' ),
					'type'        => 'integer',
					'context'     => [ 'view' ],
					'readonly'    => true,
				],
				'countFormatted' => [
					'description' => __( 'Formatted like count', 'rest-likes' ),
					'type'        => 'string',
					'format'      => 'date-time',
					'context'     => [ 'view' ],
					'readonly'    => true,
				],
			],
		];

		return $this->add_additional_fields_schema( $schema );
	}
}
