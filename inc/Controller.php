<?php
/**
 * REST Likes Controller.
 */

namespace Required\RestLikes;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

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
	 *
	 * @var string
	 */
	protected static $object_type;

	/**
	 * REST field & meta key value.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $meta_key = '_rest_likes';

	/**
	 * REST namespace.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $namespace = 'rest-likes';

	/**
	 * REST route version.
	 *
	 * @since 1.0.0
	 *
	 * @var int
	 */
	protected $version = 1;

	/**
	 * Adds WordPress hooks.
	 *
	 * @since 1.0.0
	 */
	public function add_hooks() {
		add_action( 'rest_api_init', [ $this, 'add_rest_route' ] );
		add_action( 'rest_api_init', [ $this, 'add_rest_field' ] );
	}

	/**
	 * Returns a list of class names for use in the HTML markup.
	 *
	 * These can be filtered to use class names that better suit the current theme.
	 *
	 * @since 1.0.0
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
		return apply_filters(
			'rest_likes.classnames',
			[
				'count'      => 'rest-like-count',
				'button'     => 'rest-like-button',
				'label'      => 'rest-like-button-label',
				'liked'      => 'has-like',
				'processing' => 'rest-like-processing',
			],
			$this->get_object_type()
		);
	}

	/**
	 * Returns a list of translatable strings.
	 *
	 * These can be filtered to use strings that better suit the current theme.
	 *
	 * @since 1.2.0
	 *
	 * @param int $likes Number of likes.
	 * @return array An array of labels.
	 */
	public function get_labels( $likes = 0 ) {
		$object_type = $this->get_object_type();

		/**
		 * Filters the text displayed inside the like button.
		 *
		 * @since 1.0.0
		 *
		 * @param string $button_text The button text. Default 'Like'.
		 * @param string $object_type The object type this button is for.
		 */
		$like_button_text = apply_filters( 'rest_likes.button_text.like', _x( 'Like', 'verb', 'rest-likes' ), $object_type );

		/**
		 * Filters the translatable strings for a given object type.
		 *
		 * @since 1.2.0
		 *
		 * @param array  $labels  The list of translatable strings.
		 * @param string $object_type The object type the labels are for.
		 * @param int    $likes       Current count of likes.
		 */
		$labels = apply_filters(
			'rest_likes.labels',
			[
				'invalid'          => __( 'You cannot like the same thing all day long', 'rest-likes' ),
				'like_button_text' => $like_button_text,
				/* translators: %d: Like count */
				'speak_like'       => __( 'Like processed. New like count: %d', 'rest-likes' ),
				/* translators: %d: Like count */
				'speak_unlike'     => __( 'Unlike processed. New like count: %d', 'rest-likes' ),
				'one_like'         => __( 'One like', 'rest-likes' ),
				/* translators: %s: Formatted number of likes */
				'plural_likes'     => _n( '%s like', '%s likes', $likes, 'rest-likes' ),
			],
			$object_type,
			$likes
		);

		return $labels;
	}

	/**
	 * Returns the meta key for the object type.
	 *
	 * @since 1.0.0
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
	 */
	public function add_rest_field() {
		register_rest_field(
			$this->get_rest_field_object_type(),
			$this->get_meta_key(),
			[
				'get_callback' => [ $this, 'rest_field_get_callback' ],
				'schema'       => [
					'type'        => 'integer',
					'description' => 'The number of likes the object has.',
					'context'     => [ 'view', 'edit', 'embed' ],
				],
			]
		);
	}

	/**
	 * GET callback for the likes REST field.
	 *
	 * @since 1.0.0
	 *
	 * @param array $object Data object.
	 * @return int The like count.
	 */
	public function rest_field_get_callback( array $object ) {
		return $this->get_like_count( $object['id'] );
	}

	/**
	 * Returns the REST route with a placeholder for the object ID.
	 *
	 * That way, the placeholder can be easily replaced in JavaScript for example.
	 *
	 * @since 1.0.0
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
	 */
	public function add_rest_route() {
		register_rest_route(
			$this->get_namespace(),
			$this->get_rest_route(),
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'args'                => [
						'id' => [
							'sanitize_callback' => '\\absint',
							'required'          => true,
						],
					],
					'permission_callback' => '__return_true',
					'callback'            => [ $this, 'get_like' ],
				],
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
			]
		);
	}

	/**
	 * Checks permissions on the object ID.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request Object.
	 * @return true|\WP_Error True if the user has permissions, WP_Error otherwise.
	 */
	public function check_permission( WP_REST_Request $request ) {
		$result = true;

		if ( $this->transient_exists( $request ) ) {
			$result = new \WP_Error( 'invalid_action', $this->get_labels()['invalid'], [ 'status' => 400 ] );
		}

		/**
		 * Filters the permission for the current REST request.
		 *
		 * @since 1.0.0
		 *
		 * @param true|\WP_Error   $result  Permission result. True if the user has permissions, WP_Error otherwise.
		 * @param \WP_REST_Request $request Request Object.
		 */
		$result = apply_filters( 'rest_likes.request_permission', $result, $request );

		if ( is_wp_error( $result ) && 'parse_request' === current_action() ) {
			/**
			 * Fires when the like request was rejected.
			 *
			 * @since 1.1.0
			 *
			 * @param \WP_Error        $result      Permission result.
			 * @param int              $object_id   Object ID.
			 * @param string           $object_type Object type.
			 * @param \WP_REST_Request $request     Request Object.
			 */
			do_action( 'rest_likes.request_rejected', $result, $request['id'], $this->get_object_type(), $request );
		}

		return $result;
	}

	/**
	 * Checks if there's already a like for an object from a given IP address.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return True if the user has already liked this object, false otherwise.
	 */
	protected function transient_exists( WP_REST_Request $request ) {
		$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
		$transient  = sprintf(
			'%s_like_%s',
			$this->get_object_type(),
			md5( $ip_address . $request['id'] . $request->get_method() )
		);

		return (bool) get_transient( $transient );
	}

	/**
	 * Sets the transient for the current object and user.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 */
	protected function set_transient( $request ) {
		$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
		$transient  = sprintf(
			'%s_like_%s',
			$this->get_object_type(),
			md5( $ip_address . $request['id'] . $request->get_method() )
		);

		/**
		 * Filters the expiration of a transient.
		 *
		 * @since 1.0.0
		 *
		 * @param int             $expiration Time until expiration in seconds. Default 2 minutes.
		 * @param \WP_REST_Request $request Current request object.
		 */
		$expiration = apply_filters( 'rest_likes.transient_expiration', 2 * MINUTE_IN_SECONDS, $request );

		set_transient( $transient, 1, $expiration );
	}

	/**
	 * Deletes like and unlike transients for the current object and user.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 */
	protected function delete_transients( $request ) {
		$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

		$like = sprintf(
			'%s_like_%s',
			$this->get_object_type(),
			md5( $ip_address . $request['id'] . WP_REST_Server::CREATABLE )
		);

		delete_transient( $like );

		$unlike = sprintf(
			'%s_like_%s',
			$this->get_object_type(),
			md5( $ip_address . $request['id'] . WP_REST_Server::DELETABLE )
		);

		delete_transient( $unlike );
	}

	/**
	 * Gets like counts of an object.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function get_like( $request ) {
		$likes      = $this->get_like_count( $request['id'] );
		$likes_i18n = number_format_i18n( $likes );

		return new WP_REST_Response(
			[
				'count'          => $likes,
				'countFormatted' => $likes_i18n,
			]
		);
	}

	/**
	 * Adds a like to an object.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function add_like( $request ) {
		$this->delete_transients( $request );
		$this->set_transient( $request );
		return new WP_REST_Response( $this->handle_like( $request['id'], false ), 201 );
	}

	/**
	 * Removes a like from an object.
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function remove_like( $request ) {
		$this->delete_transients( $request );
		$this->set_transient( $request );
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
	 *
	 * @param int  $object_id Object ID.
	 * @param bool $remove    Whether to increment or decrement the counter.
	 * @return array Response data containing the new like count, raw and formatted.
	 */
	public function handle_like( $object_id, $remove = false ) {
		/**
		 * Filters whether to increment or decrement the like count for the current object.
		 *
		 * @since 1.0.0
		 *
		 * @param bool   $remove      Whether to increment or decrement the counter.
		 * @param int    $object_id   Object ID.
		 * @param string $object_type Object type.
		 */
		$remove = apply_filters( 'rest_likes.decrement_like_count', $remove, $object_id, $this->get_object_type() );

		$old_likes = $this->get_like_count( $object_id );
		$likes     = $remove ? $old_likes - 1 : $old_likes + 1;
		$likes     = max( $likes, 0 );

		update_metadata( $this->get_object_type(), $object_id, $this->get_meta_key(), $likes );

		$likes_i18n = number_format_i18n( $likes );

		/**
		 * Fires when the like count is updated for an object.
		 *
		 * @since 1.0.0
		 * @since 1.1.0 Added `$remove` argument.
		 *
		 * @param string $object_type The object type.
		 * @param int    $object_id   Object ID.
		 * @param int    $likes       The like count.
		 * @param int    $likes_i18n  The formatted like count.
		 * @param int    $old_likes   The old like count.
		 * @param bool   $remove      Whether to increment or decrement the counter.
		 */
		do_action( 'rest_likes.update_likes', $this->get_object_type(), $object_id, $likes, $likes_i18n, $old_likes, $remove );

		return [
			'count'            => $likes,
			'countFormatted'   => $likes_i18n,
			'screenReaderText' => 1 === $likes ? $this->get_labels()['one_like'] : $this->get_labels( $likes )['plural_likes'],
		];
	}

	/**
	 * Returns the like button markup.
	 *
	 * @since 1.0.0
	 *
	 * @param int $object_id Object ID.
	 * @return string Like button markup.
	 */
	public function get_like_button( $object_id ) {
		$object_id = absint( $object_id );

		$button = sprintf(
			'<button class="%1$s" data-rest-like-button data-type="%2$s" data-id="%3$d" data-speak-like="%4$s" data-speak-unlike="%5$s">%6$s %7$s</button>',
			esc_attr( $this->get_classnames()['button'] ), // Class name.
			esc_attr( $this->get_object_type() ), // Object type.
			absint( $object_id ), // Object ID.
			esc_attr( $this->get_labels()['speak_like'] ), // JS data attribute for speak text after like.
			esc_attr( $this->get_labels()['speak_unlike'] ), // JS data attribute for speak text after unlike.
			sprintf( '<span class="%1$s">%2$s</span>', $this->get_classnames()['label'], $this->get_labels()['like_button_text'] ), // Button HTML content.
			$this->get_like_count_html( $object_id ), // Like count HTML content.
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
	 *
	 * @param int $object_id Object ID.
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_id ) {
		$likes = $this->get_like_count( $object_id );

		if ( 1 === $likes ) {
			$likes_text = $this->get_labels()['one_like'];
		} else {
			$likes_text = sprintf(
				$this->get_labels( $likes )['plural_likes'],
				$likes
			);
		}

		return sprintf(
			apply_filters( 'rest_likes.count_markup', '<span class="%1$s" data-type="%2$s" data-id="%3$d" data-likes="%4$d"><span aria-hidden="true">%5$s</span><span class="screen-reader-text">%6$s</span></span>' ),
			esc_attr( $this->get_classnames()['count'] ),
			esc_attr( $this->get_object_type() ),
			absint( $object_id ),
			esc_attr( $likes ),
			esc_html( number_format_i18n( $likes ) ),
			esc_html( $likes_text )
		);
	}

	/**
	 * Retrieves the item's schema, conforming to JSON Schema.
	 *
	 * @since 1.0.0
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
