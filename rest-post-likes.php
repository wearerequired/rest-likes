<?php
/**
 * Plugin Name: REST Post Likes
 * Description: WP REST API Post Likes
 * Author: Silvan Hagen
 * Version: 1.0
 * Author URI: https://wearerequired.com
 *
 * @package rest-post-likes
 */

namespace Required\RestPostLikes;

use WP_Error;
use WP_REST_Server;
use WP_REST_Response;

/**
 * Class Controller
 *
 * @package RestPostLikes
 */
class Controller {

	/**
	 * API Version.
	 *
	 * @var int
	 */
	protected $version = 1;

	/**
	 * API Namespace.
	 *
	 * @var string
	 */
	protected $namespace;

	/**
	 * API Allowed post types.
	 *
	 * @var array
	 */
	protected $allowed_post_types;

	/**
	 * REST field & meta key value.
	 *
	 * @var string
	 */
	protected $meta_key = 'rest_post_likes';

	/**
	 * Controller constructor.
	 */
	public function __construct() {
		// Set allowed post types, allow filtering.
		$this->allowed_post_types = apply_filters( 'rest_post_likes_allowed_post_types', [ 'post', 'page' ] );

		// Set our API namespace.
		$this->namespace = apply_filters( 'rest_post_likes_namespace', 'rest-post-likes' ) . '/v' . $this->version;

		$this->add_hooks();
	}

	/**
	 * Add hooks to WP.
	 */
	public function add_hooks() {
		add_action( 'rest_api_init', [ $this, 'add_rest_route' ] );
		add_action( 'rest_api_init', [ $this, 'add_rest_field' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_filter( 'the_content', [ $this, 'add_button_to_content' ] );
	}

	/**
	 * Register a new field on the REST API "post" object
	 * so clients can display the Post Like count with posts.
	 */
	public function add_rest_field() {
		if ( ! function_exists( 'register_rest_field' ) ) {
			return;
		}
		register_rest_field( $this->allowed_post_types, $this->meta_key, array(
			'get_callback' => function( $request ) {
				return (int) get_post_meta( $request['id'], $this->meta_key, true );
			},
			'schema'       => array(
				'type'        => 'integer',
				'description' => 'The number of Post Likes the post has.',
				'context'     => array( 'view', 'edit', 'embed' ),
			),
		) );
	}

	/**
	 * Register API endpoint.
	 */
	public function add_rest_route() {
		register_rest_route( $this->namespace, '/posts/(?P<id>[\d]+)/like', [
			[
				'methods' => \WP_REST_Server::CREATABLE,
				'args'    => [
					'id' => [
						'sanitize_callback' => '\\absint',
						'required'          => true,
					],
				],
				'permissions_callback' => [ $this, 'check_permission' ],
				'callback'             => [ $this, 'add_like' ],
			],
			[
				'methods' => \WP_REST_Server::DELETABLE,
				'args'    => [
					'id' => [
						'sanitize_callback' => '\\absint',
						'required'          => true,
					],
				],
				'permissions_callback' => [ $this, 'check_permission' ],
				'callback'             => [ $this, 'remove_like' ],
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
	public function check_permission( $request ) {
		if ( ! $this->check_nonce() ) {
			return new \WP_Error( 'invalid-nonce', 'No valid nonce found for action', array( 'status' => 400 ) );
		}

		if ( ! $this->check_post_type( $request['id'] ) ) {
			return new \WP_Error( 'invalid-post-type', 'You can only like.' . implode( ' and ', $this->allowed_post_types ), array( 'status' => 400 ) );
		}

		if ( 'publish' !== \get_post_status( $request['id'] ) ) {
			return new \WP_Error( 'invalid-post-status', 'You can only like' . implode( ' and ', $this->allowed_post_types ) . ' that are published.', array( 'status' => 400 ) );
		}

		return true;
	}

	/**
	 * Check nonce in the headers.
	 *
	 * @return false|int
	 */
	public function check_nonce() {
		$nonce = isset( $_SERVER['HTTP_X_WP_NONCE'] ) ? $_SERVER['HTTP_X_WP_NONCE'] : '';
		return wp_verify_nonce( $nonce, 'wp_rest' );
	}

	/**
	 * Check if this post type is allowed.
	 *
	 * @param int $post_id ID of current WP_Post object.
	 *
	 * @return bool
	 */
	public function check_post_type( $post_id ) {
		// Get post type of current id.
		$post_type = \get_post_type( $post_id );

		// Check if the post type is in the allowed array.
		if ( ! in_array( $post_type, $this->allowed_post_types, true )  ) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Register javascript on front-end.
	 */
	public function register_scripts() {
		\wp_enqueue_script( 'rest-post-likes', \esc_url( \plugin_dir_url( __FILE__ ) . 'js/rest-post-likes.js' ), [ 'wp-api' ], '1.0', true );
	}

	/**
	 * Add like to post.
	 *
	 * @param \WP_REST_Request $request API Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public function add_like( $request ) {
		return new \WP_REST_Response( $this->handle_like( $request['id'], false ), 201 );
	}

	/**
	 * Remove like from post.
	 *
	 * @param \WP_REST_Request $request API Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public function remove_like( $request ) {
		return new \WP_REST_Response( $this->handle_like( $request['id'], true ), 201 );
	}

	/**
	 * Adding or removing like from post meta.
	 *
	 * @param int  $post_id WP_Post ID.
	 * @param bool $remove toggle to add or remove like.
	 *
	 * @return array $response
	 */
	public function handle_like( $post_id, $remove = false ) {
		$likes = absint( \get_post_meta( $post_id, 'rest_post_likes', true ) );
		if ( false === $remove ) {
			$likes++;
		} else {
			$likes--;
		}
		\update_post_meta( $post_id, 'rest_post_likes', $likes );
		$response = array(
			'count' => $likes,
		);
		return $response;
	}

	/**
	 * Sample filter to add like button to the_content.
	 *
	 * @param string $content the_content of current post.
	 *
	 * @return string
	 */
	public function add_button_to_content( $content ) {
		if ( is_singular( $this->allowed_post_types ) ) {
			$content = $content . $this->get_post_like_button( \get_the_ID() );
		}
		return $content;
	}

	/**
	 * Create a like button.
	 *
	 * @param int $post_id Id of WP_Post object.
	 *
	 * @return string|WP_Error
	 */
	public function get_post_like_button( $post_id ) {

		if ( ! $this->check_post_type( $post_id ) ) {
			return new \WP_Error( 'invalid-post-type', 'You can only like posts and pages.', array( 'status' => 400 ) );
		}

		$button = '<button class="rest-post-like-button" data-action="like" data-post-id="' . $post_id . '">Like me</button>';

		return $button;
	}
}

/**
 * Load the plugin on plugins_loaded.
 *
 * @return Controller
 */
function rest_post_likes() {
	return new namespace\Controller();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\\rest_post_likes' );
