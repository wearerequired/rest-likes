<?php
/**
 * Rest Post Likes Controller.
 *
 * @package rest-post-likes
 */

namespace Required\RestLikes;

/**
 * Class Controller
 *
 * @package RestLikes
 */
class Plugin {
	/**
	 * List of object types that likes are enabled for.
	 *
	 * @var Controller[]
	 */
	protected $enabled_object_types = [];

	/**
	 * Add hooks to WP.
	 */
	public function add_hooks() {
		$allowed_object_types = apply_filters( 'rest_likes.enabled_object_types', [
			'post'    => '\Required\RestLikes\Posts',
		] );

		foreach ( $allowed_object_types as $object_type => $class ) {
			$this->enabled_object_types[ $object_type ] = new $class;
			$this->enabled_object_types[ $object_type ]->add_hooks();
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}

	/**
	 * Register javascript on front end.
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

	public function get_like_count( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
			return $this->enabled_object_types[ $object_type ]->get_like_count( $object_id );
		}

		return 0;
	}

	public function get_like_count_html( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
			return $this->enabled_object_types[ $object_type ]->get_like_count_html( $object_id );
		}

		return '';
	}

	public function get_like_button( $object_type, $object_id ) {
		if ( $this->enabled_object_types[ $object_type ] instanceof Controller ) {
			return $this->enabled_object_types[ $object_type ]->get_like_button( $object_id );
		}

		return 0;
	}
}
