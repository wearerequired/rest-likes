<?php
/**
 * REST Likes main plugin class.
 *
 * @package rest-likes
 */

namespace Required\RestLikes;
use Required\RestLikes\ObjectType\Comment;
use Required\RestLikes\ObjectType\Post;

/**
 * Main plugin class.
 */
class Plugin {
	/**
	 * List of object types that likes are enabled for.
	 *
	 * @since 1.0.0
	 *
	 * @var Controller[]
	 */
	protected $enabled_object_types = [];

	/**
	 * Initializes the plugin.
	 *
	 * Initializes the controllers for all the enabled object types and adds the necessary WordPress hooks.
	 *
	 * @since 1.0.0
	 */
	public function init() {
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
			'post'    => Post::class,
			'comment' => Comment::class,
		] );

		foreach ( $available_object_types as $object_type => $class ) {
			$this->enabled_object_types[ $object_type ] = new Controller( new $class() );
			$this->enabled_object_types[ $object_type ]->add_hooks();
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );

		add_action( 'init', [ $this, 'load_textdomain' ] );
	}

	/**
	 * Loads the plugin's text domain.
	 *
	 * @since 1.0.0
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'rest-likes', false, basename( plugin_dir_path( __DIR__ ) ) . '/languages' );
	}

	/**
	 * Registers JavaScript on front end.
	 *
	 * @since 1.0.0
	 */
	public function register_scripts() {
		$suffix = SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'rest-likes',
			esc_url( plugin_dir_url( __DIR__ ) . 'js/rest-likes' . $suffix . '.js' ),
			[ 'jquery', 'underscore', 'wp-a11y' ],
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
	 *
	 * @return array Data for use in JavaScript part.
	 */
	protected function get_object_types_script_data() {
		$script_data = [];

		foreach ( $this->enabled_object_types as $object_type => $controller ) {
			$script_data[ $object_type ] = $controller->get_script_data();
		}

		return $script_data;
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
		if ( isset( $this->enabled_object_types[ $object_type ] ) ) {
			return $this->enabled_object_types[ $object_type ]->get_like_count( $object_id );
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
		if ( isset( $this->enabled_object_types[ $object_type ] ) ) {
			return $this->enabled_object_types[ $object_type ]->get_like_count_html( $object_id );
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
		if ( isset( $this->enabled_object_types[ $object_type ] ) ) {
			wp_enqueue_script( 'rest-likes' );

			return $this->enabled_object_types[ $object_type ]->get_like_button( $object_id );
		}

		return '';
	}
}
