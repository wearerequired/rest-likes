<?php
/**
 * REST Likes main plugin class.
 */

namespace Required\RestLikes;

use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use function Required\Traduttore_Registry\add_project;

/**
 * Main plugin class.
 */
class Plugin {
	/**
	 * REST namespace of the like counts route.
	 *
	 * @since 3.0.0
	 */
	const REST_NAMESPACE = 'rest-likes/v1';

	/**
	 * REST route for fetching like counts of multiple objects.
	 *
	 * @since 3.0.0
	 */
	const COUNTS_ROUTE = '/counts';

	/**
	 * Maximum number of object IDs per object type in a single like counts request.
	 *
	 * @since 3.0.0
	 */
	const MAX_COUNTS_PER_TYPE = 100;

	/**
	 * List of object types that likes are enabled for.
	 *
	 * @since 1.0.0
	 *
	 * @var \Required\RestLikes\Controller[]
	 */
	protected $enabled_object_types = [];

	/**
	 * Adds WordPress hooks.
	 *
	 * Initializes the controllers for all the enabled object types.
	 *
	 * @since 1.0.0
	 */
	public function add_hooks() {
		/**
		 * Filters the object types likes are enabled for.
		 *
		 * Contains an array with the object type as the key,
		 * and the value being a class extending the Controller class.
		 *
		 * @since 1.0.0
		 *
		 * @param array $object_types Array of object types. Default 'post' and 'comment'.
		 */
		$available_object_types = (array) apply_filters(
			'rest_likes.enabled_object_types',
			[
				'post'    => Posts::class,
				'comment' => Comments::class,
			]
		);

		foreach ( $available_object_types as $object_type => $class ) {
			$this->enabled_object_types[ $object_type ] = new $class();
			$this->enabled_object_types[ $object_type ]->add_hooks();
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );

		add_action( 'init', [ $this, 'init_traduttore' ] );

		add_action( 'rest_api_init', [ $this, 'add_counts_rest_route' ] );

		Blocks\bootstrap();
	}

	/**
	 * Adds support for translations via Traduttore.
	 *
	 * @since 1.0.0
	 */
	public function init_traduttore() {
		add_project(
			'plugin',
			'rest-likes',
			'https://translate.required.com/api/translations/required/rest-likes/'
		);
	}

	/**
	 * Registers the REST route for fetching like counts of multiple objects.
	 *
	 * Uses GET so that responses can be cached by a page cache, which matters
	 * because every open tab polls this route.
	 *
	 * @since 3.0.0
	 */
	public function add_counts_rest_route() {
		$args = [];

		foreach ( array_keys( $this->enabled_object_types ) as $object_type ) {
			$args[ $object_type ] = [
				'type'     => 'array',
				'items'    => [
					'type'    => 'integer',
					'minimum' => 1,
				],
				'maxItems' => self::MAX_COUNTS_PER_TYPE,
				'default'  => [],
			];
		}

		register_rest_route(
			self::REST_NAMESPACE,
			self::COUNTS_ROUTE,
			[
				'methods'             => WP_REST_Server::READABLE,
				'args'                => $args,
				'permission_callback' => '__return_true',
				'callback'            => [ $this, 'get_like_counts' ],
			]
		);
	}

	/**
	 * Returns the like counts for the requested objects.
	 *
	 * @since 3.0.0
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function get_like_counts( WP_REST_Request $request ) {
		$counts = [];

		foreach ( $this->enabled_object_types as $object_type => $controller ) {
			if ( empty( $request[ $object_type ] ) ) {
				continue;
			}

			foreach ( $controller->get_like_counts( $request[ $object_type ] ) as $count ) {
				$counts[] = array_merge( [ 'objectType' => $object_type ], $count );
			}
		}

		return new WP_REST_Response( $counts );
	}

	/**
	 * Registers JavaScript on front end.
	 *
	 * @since 1.0.0
	 */
	public function register_scripts() {
		$script_asset = require REST_LIKES_PLUGIN_DIR . '/js/dist/rest-likes.asset.php';

		wp_register_script(
			'rest-likes',
			plugin_dir_url( REST_LIKES_PLUGIN_FILE ) . 'js/dist/rest-likes.js',
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		/**
		 * Filters the interval in seconds in which like counts are refreshed while the page is visible.
		 *
		 * Pages are usually served from a page cache, so the counts in the markup can be outdated.
		 *
		 * @since 3.0.0
		 *
		 * @param int $interval Refresh interval in seconds, at most one day. 0 or less disables refreshing. Default 120.
		 */
		$refresh_interval = (int) apply_filters( 'rest_likes.refresh_interval', 120 );

		// Browsers fire timeouts longer than ~24.8 days immediately, which would cause a request loop.
		$refresh_interval = min( max( 0, $refresh_interval ), DAY_IN_SECONDS );

		$script_data = [
			'root'             => esc_url_raw( get_rest_url() ),
			'object_types'     => $this->get_object_types_script_data(),
			'counts_endpoint'  => self::REST_NAMESPACE . self::COUNTS_ROUTE,
			'refresh_interval' => $refresh_interval,
			'counts_limit'     => self::MAX_COUNTS_PER_TYPE,
		];

		if ( is_user_logged_in() ) {
			$script_data['nonce'] = wp_create_nonce( 'wp_rest' );
		}

		wp_localize_script(
			'rest-likes',
			'restLikes',
			$script_data
		);
	}

	/**
	 * Returns script data for all enabled object types.
	 *
	 * @since 1.0.0
	 *
	 * @return array Data for use in JavaScript part.
	 */
	protected function get_object_types_script_data() {
		$script_data = [];

		foreach ( $this->enabled_object_types as $object_type => $controller ) {
			$script_data[ $object_type ] = [
				'endpoint'   => $controller->get_namespace() . $controller->get_rest_route_placeholder(),
				'classnames' => $controller->get_classnames(),
				'texts'      => [
					/** This filter is documented in classes/Controller.php */
					'like'   => apply_filters( 'rest_likes.button_text.like', _x( 'Like', 'verb', 'rest-likes' ), $object_type ),
					/**
					 * Filters the text displayed inside the unlike button.
					 *
					 * @since 1.0.0
					 *
					 * @param string $button_text The button text. Default 'Unlike'.
					 * @param string $object_type The object type this button is for.
					 */
					'unlike' => apply_filters( 'rest_likes.button_text.unlike', _x( 'Unlike', 'verb', 'rest-likes' ), $object_type ),
				],
			];
		}

		return $script_data;
	}

	/**
	 * Returns the Controller instance for a given object type.
	 *
	 * @since 1.0.0
	 *
	 * @param string $object_type Object type.
	 * @return \Required\RestLikes\Controller Controller instance.
	 */
	public function get_object_type_controller( $object_type ) {
		if (
			isset( $this->enabled_object_types[ $object_type ] ) &&
			$this->enabled_object_types[ $object_type ] instanceof Controller
		) {
			return $this->enabled_object_types[ $object_type ];
		}

		return null;
	}

	/**
	 * Returns the like count for the given object.
	 *
	 * @since 1.0.0
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return int Like count.
	 */
	public function get_like_count( $object_type, $object_id ) {
		$controller = $this->get_object_type_controller( $object_type );

		if ( $controller ) {
			return $controller->get_like_count( $object_id );
		}

		return 0;
	}

	/**
	 * Returns the like count markup for the given object.
	 *
	 * @since 1.0.0
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_type, $object_id ) {
		$controller = $this->get_object_type_controller( $object_type );

		if ( $controller ) {
			return $controller->get_like_count_html( $object_id );
		}

		return '';
	}

	/**
	 * Returns the like button for the given object.
	 *
	 * @since 1.0.0
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return string Like button.
	 */
	public function get_like_button( $object_type, $object_id ) {
		$controller = $this->get_object_type_controller( $object_type );

		if ( $controller ) {
			wp_enqueue_script( 'rest-likes' );

			return $controller->get_like_button( $object_id );
		}

		return '';
	}
}
