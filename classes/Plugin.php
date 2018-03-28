<?php
/**
 * REST Likes main plugin class.
 *
 * @package rest-likes
 */

namespace Required\RestLikes;

/**
 * Main plugin class.
 */
class Plugin {
	/**
	 * List of object types that likes are enabled for.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @var Controller[]
	 */
	protected $enabled_object_types = [];

	/**
	 * Adds WordPress hooks.
	 *
	 * Initializes the controllers for all the enabled object types.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_hooks() {
		/**
		 * Filters the object types likes are enabled for.
		 *
		 * Contains an array with thebject type as the key,
		 * and the value being a class extending the Controller class.
		 *
		 * @since 1.0.0
		 *
		 * @param array $object_types Array of object types. Default 'post' and 'comment'.
		 */
		$available_object_types = apply_filters( 'rest_likes.enabled_object_types', [
			'post'    => Posts::class,
			'comment' => Comments::class,
		] );

		foreach ( $available_object_types as $object_type => $class ) {
			$this->enabled_object_types[ $object_type ] = new $class;
			$this->enabled_object_types[ $object_type ]->add_hooks();
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );

		add_action( 'init', [ $this, 'load_textdomain' ] );

		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
	}

	/**
	 * Loads the plugin's text domain.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'rest-likes', false, basename( plugin_dir_path( __DIR__ ) ) . '/languages' );
	}

	/**
	 * Receive Heartbeat data and respond.
	 *
	 * Processes data received via a Heartbeat request, and returns additional data to pass back to the front end.
	 *
	 * @since 1.0.0
	 *
	 * @param array $response Heartbeat response data to pass back to front end.
	 * @param array $data Data received from the front end (unslashed).
	 * @return array Filtered heartbeat response data.
	 */
	public function heartbeat_received( $response, $data ) {
		if ( empty( $data['rest_likes'] ) ) {
			return $response;
		}

		$response['rest_likes'] = [];

		foreach ( (array) $data['rest_likes'] as $object_type => $object_ids ) {
			foreach ( (array) $object_ids as $object_id ) {
				$response['rest_likes'][] = [
					'objectType'     => $object_type,
					'objectId'       => $object_id,
					'count'          => $this->get_like_count( $object_type, $object_id ),
					'countFormatted' => number_format_i18n( $this->get_like_count( $object_type, $object_id ) ),
				];
			}
		}

		return $response;
	}

	/**
	 * Registers JavaScript on front end.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_scripts() {
		$suffix = SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'rest-likes',
			esc_url( plugin_dir_url( __DIR__ ) . 'js/rest-likes' . $suffix . '.js' ),
			[ 'jquery', 'underscore', 'wp-a11y', 'heartbeat' ],
			'1.0.1',
			true
		);

		$script_data = [
			'root'         => esc_url_raw( get_rest_url() ),
			'object_types' => $this->get_object_types_script_data(),
			'l10n'         => [
				/* translators: %d: Like count */
				'likeMsg'   => __( 'Like processed. New like count: %d', 'rest-likes' ),
				/* translators: %d: Like count */
				'unlikeMsg' => __( 'Unlike processed. New like count: %d', 'rest-likes' ),
				'errorMsg'  => __( 'There was an error processing your request.', 'rest-likes' ),
			],
		];

		if ( is_user_logged_in() ) {
			$script_data['nonce'] = wp_create_nonce( 'wp_rest' );
		}

		/**
		 * Filters the script data used by the plugin.
		 *
		 * @since 1.0.0
		 *
		 * @param array $script_data Associative array of script data.
		 */
		$script_data = apply_filters( 'rest_likes.script_data', $script_data );

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
	 * @access protected
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
	 * Returns the like count for the given object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return int Like count.
	 */
	public function get_like_count( $object_type, $object_id ) {
		if (
			isset( $this->enabled_object_types[ $object_type ] ) &&
			$this->enabled_object_types[ $object_type ] instanceof Controller
		) {
			return $this->enabled_object_types[ $object_type ]->get_like_count( $object_id );
		}

		return 0;
	}


	/**
	 * Returns the like count markup for the given object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_type, $object_id ) {
		if (
			isset( $this->enabled_object_types[ $object_type ] ) &&
			$this->enabled_object_types[ $object_type ] instanceof Controller
		) {
			return $this->enabled_object_types[ $object_type ]->get_like_count_html( $object_id );
		}

		return '';
	}


	/**
	 * Returns the like button for the given object.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $object_type Object type.
	 * @param int    $object_id   Object ID.
	 * @return string Like button.
	 */
	public function get_like_button( $object_type, $object_id ) {
		if (
			isset( $this->enabled_object_types[ $object_type ] ) &&
			$this->enabled_object_types[ $object_type ] instanceof Controller
		) {
			wp_enqueue_script( 'rest-likes' );

			return $this->enabled_object_types[ $object_type ]->get_like_button( $object_id );
		}

		return '';
	}
}
