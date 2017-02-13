<?php
/**
 * Rest Post Likes Controller.
 *
 * @package rest-post-likes
 */

namespace Required\RestLikes;

use WP_Error;
use WP_REST_Server;
use WP_REST_Response;
use WP_REST_Request;
use WP_REST_Controller;

/**
 * Class Controller
 *
 * @package RestLikes
 */
abstract class Controller extends WP_REST_Controller {
	/**
	 * REST field & meta key value.
	 *
	 * @var string
	 */
	protected $meta_key = 'rest_likes';

	protected $namespace = 'rest-likes';

	protected $version = 1;

	/**
	 * Add hooks to WP.
	 */
	public function add_hooks() {
		add_action( 'rest_api_init', [ $this, 'add_rest_route' ] );
		add_action( 'rest_api_init', [ $this, 'add_rest_field' ] );
		add_action( 'rest_pre_dispatch', [ $this, 'rest_pre_dispatch' ], 10, 3 );
	}

	public function get_classnames() {
		/**
		 * Filters the CSS class names for a given object type.
		 *
		 * @param array  $classnames  The list of CSS class names.
		 * @param string $object_type The object type the class names are for.
		 */
		return apply_filters( 'rest_likes.classnames', [
			'count'      => 'rest-like-count',
			'button'     => 'rest-like-button',
			'liked'      => 'has-like',
			'processing' => 'rest-like-processing',
		], $this->get_object_type() );
	}

	/**
	 * Returns the meta key for the object type.
	 *
	 * @return string
	 */
	public function get_meta_key() {
		return $this->meta_key;
	}

	/**
	 * Returns the REST API namespace for the object type.
	 *
	 * @return string
	 */
	public function get_namespace() {
		return $this->namespace . '/v' . $this->version;
	}

	public function get_rest_field_object_type() {
		return $this->get_object_type();
	}

	/**
	 * Register a new field on the REST API "post" object
	 * so clients can display the Post Like count with posts.
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

	public function rest_field_get_callback( \WP_REST_Request $request ) {
		return $this->get_like_count( $request['id'] );
	}

	public function get_rest_route_placeholder() {
		return sprintf( '/%ss/%%s/like', $this->get_object_type() );
	}

	protected function get_rest_route() {
		return sprintf( $this->get_rest_route_placeholder(), '(?P<id>[\d]+)' );
	}

	/**
	 * Register API endpoint.
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
	 * Check permissions on the object id.
	 *
	 * @param \WP_REST_Request $request Request Object.
	 *
	 * @return bool|WP_Error
	 */
	public function check_permission( \WP_REST_Request $request ) {
		if ( $this->transient_exists( $request ) ) {
			return new WP_Error( 'invalid_action', 'You cannot like the same thing all day long', array( 'status' => 400 ) );
		}

		return true;
	}

	/**
	 * Checks if there's already a like for a post from a given IP address.
	 *
	 * @param \WP_REST_Request $request Request Object.
	 *
	 * @return True if the user has already liked this post, false otherwise.
	 */
	public function transient_exists( \WP_REST_Request $request ) {
		$ip_address = isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
		$transient  = sprintf( '%s_like_%s', $this->get_object_type(), md5( $ip_address . $request['id'] . $request->get_method() ) );

		$value = get_transient( $transient );

		if ( ! $value ) {
			set_transient( $transient, 1, 2 * MINUTE_IN_SECONDS );

			return false;
		}

		return true;
	}

	/**
	 * Add like to post.
	 *
	 * @param \WP_REST_Request $request API Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public function add_like( $request ) {
		return new WP_REST_Response( $this->handle_like( $request['id'], false ), 201 );
	}

	/**
	 * Remove like from post.
	 *
	 * @param \WP_REST_Request $request API Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public function remove_like( $request ) {
		return new WP_REST_Response( $this->handle_like( $request['id'], true ), 200 );
	}

	/**
	 * Adding or removing like from post meta.
	 *
	 * @param int  $object_id Object ID.
	 * @param bool $remove    Whether to increment or decrement the counter.
	 *
	 * @return array
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
	 * @param int $object_id Object ID.
	 *
	 * @return string
	 */
	public function get_like_button( $object_id ) {
		$object_id = absint( $object_id );

		$button = sprintf( apply_filters( 'rest_likes.button_markup', '<button class="%1$s" data-type="%2$s" data-id="%3$d" data-rest-like-button>%4$s %5$s</button>' ),
			esc_attr( $this->get_classnames()['button'] ),
			esc_attr( $this->get_object_type() ),
			$object_id,
			apply_filters( 'rest_likes.button_text', _x( 'Like', 'verb', 'rest-post-likes' ) ),
			$this->get_like_count( $object_id ) ? $this->get_like_count( $object_id ) : 0
		);

		return $button;
	}

	/**
	 * Get like count for an object.
	 *
	 * @param int $object_id Object ID.
	 *
	 * @return int
	 */
	public function get_like_count( $object_id ) {
		return absint( get_metadata( $this->get_object_type(), $object_id, $this->get_meta_key(), true ) );
	}

	/**
	 * Returns the like count with markup.
	 *
	 * @param int $object_id Object ID.
	 *
	 * @return string
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
	 * @link https://github.com/wearerequired/rest-post-likes/issues/5
	 *
	 * @param mixed            $result  Response to replace the requested version with. Can be anything
	 *                                  a normal endpoint can return, or null to not hijack the request.
	 * @param WP_REST_Server  $server  Server instance.
	 * @param WP_REST_Request $request Request used to generate the response.
	 *
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
	 * Retrieves the post's schema, conforming to JSON Schema.
	 *
	 * @since  1.0.0
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
					'description' => __( 'Like count', 'rest-post-likes' ),
					'type'        => 'integer',
					'context'     => [ 'view' ],
					'readonly'    => true,
				],
				'countFormatted' => [
					'description' => __( 'Formatted like count', 'rest-post-likes' ),
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
