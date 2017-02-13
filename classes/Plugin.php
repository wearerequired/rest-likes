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
	 * Add WordPress hooks.
	 *
	 * Initializes the controllers for all the enabled object types.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function add_hooks() {
		$available_object_types = apply_filters( 'rest_likes.enabled_object_types', [
			'post' => '\Required\RestLikes\Posts',
		] );

		foreach ( $available_object_types as $object_type => $class ) {
			$this->enabled_object_types[ $object_type ] = new $class;
			$this->enabled_object_types[ $object_type ]->add_hooks();
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}

	/**
	 * Register javascript on front end.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_scripts() {
		// Enqueue the plugin script & dependencies.
		wp_enqueue_script(
			'rest-likes',
			\esc_url( \plugin_dir_url( __DIR__ ) . 'js/rest-likes.js' ),
			[ 'jquery', 'underscore' ],
			'1.0.0',
			true
		);

		// Localize the plugin script.
		wp_localize_script(
			'rest-likes',
			'restLikes',
			apply_filters( 'rest_likes.script_data',
				[
					'root'         => esc_url_raw( get_rest_url() ),
					'object_types' => $this->get_object_types_script_data(),
				]
			)
		);
	}

	/**
	 * Returns script data for all enabled object types.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array
	 */
	protected function get_object_types_script_data() {
		$script_data = [];

		foreach ( $this->enabled_object_types as $object_type => $controller ) {
			$script_data[ $object_type ] = [
				'endpoint'   => $controller->get_namespace() . $controller->get_rest_route_placeholder(),
				'classnames' => $controller->get_classnames(),
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
	 *
	 * @return int Like count.
	 */
	public function get_like_count( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
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
	 *
	 * @return string Like count markup.
	 */
	public function get_like_count_html( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
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
	 *
	 * @return string Like button.
	 */
	public function get_like_button( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
			return $this->enabled_object_types[ $object_type ]->get_like_button( $object_id );
		}

		return '';
	}
}
