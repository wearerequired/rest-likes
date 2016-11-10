<?php
/**
 * Rest Post Likes Controller.
 *
 * @package rest-post-likes
 */

namespace Required\RestPostLikes;

use WP_Error;
use WP_REST_Server;
use WP_REST_Response;
use WP_REST_Controller;

/**
 * Class Controller
 *
 * @package RestPostLikes
 */
class Controller extends WP_REST_Controller {

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
	public $namespace;

	/**
	 * API Allowed post types.
	 *
	 * @var array
	 */
	public $allowed_post_types;

	/**
	 * REST field & meta key value.
	 *
	 * @var string
	 */
	public $meta_key = 'rest_post_likes';

	/**
	 * CSS Classnames.
	 *
	 * @var array
	 */
	public $classnames;

	/**
	 * Controller constructor.
	 */
	public function __construct() {
		$this->add_hooks();
	}

	/**
	 * Add hooks to WP.
	 */
	public function add_hooks() {
		add_action( 'rest_api_init', [ $this, 'add_rest_route' ] );
		add_action( 'rest_api_init', [ $this, 'add_rest_field' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'init', [ $this, 'setup' ] );
		add_action( 'rest_pre_dispatch', [ $this, 'rest_pre_dispatch' ], 10, 3 );
	}

	/**
	 * Setup the defaults.
	 *
	 * Note: This function is hooked to init, so a theme could
	 * potentially overwrite the defaults with the filters below.
	 */
	public function setup() {
		// Set allowed post types, allow filtering.
		$this->allowed_post_types = \apply_filters( 'rest_post_likes_allowed_post_types', [ 'post', 'page' ] );

		// Set our API namespace.
		$this->namespace = \apply_filters( 'rest_post_likes_namespace', 'rest-post-likes' ) . '/v' . $this->version;

		// Set default css classnames.
		$this->classnames = \apply_filters( 'rest_post_likes_classnames', [
			'count_classname' => 'rest-like-count',
			'button_classname' => 'rest-like-button',
			'liked_classname' => 'has-like',
			'processing_classname' => 'rest-like-processing',
		] );
	}

	/**
	 * Register a new field on the REST API "post" object
	 * so clients can display the Post Like count with posts.
	 */
	public function add_rest_field() {
		register_rest_field( $this->allowed_post_types, $this->meta_key, [
			'get_callback' => function ( $request ) {
				return (int) get_post_meta( $request['id'], $this->meta_key, true );
			},
			'schema'       => [
				'type'        => 'integer',
				'description' => 'The number of Post Likes the post has.',
				'context'     => [ 'view', 'edit', 'embed' ],
			],
		] );
	}

	/**
	 * Register API endpoint.
	 */
	public function add_rest_route() {
		register_rest_route( $this->namespace, '/posts/(?P<id>[\d]+)/like', [
			[
				'methods' => WP_REST_Server::CREATABLE,
				'args'    => [
					'id' => [
						'sanitize_callback' => '\\absint',
						'required'          => true,
					],
				],
				'permission_callback' => [ $this, 'check_permission' ],
				'callback'            => [ $this, 'add_like' ],
			],
			[
				'methods' => WP_REST_Server::DELETABLE,
				'args'    => [
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
	public function check_permission( $request ) {
		if ( ! $this->check_nonce() ) {
			return new WP_Error( 'invalid-nonce', 'No valid nonce found for action', array( 'status' => 400 ) );
		}

		if ( ! $this->check_post_type( $request['id'] ) ) {
			return new WP_Error( 'invalid-post-type', 'You can only like ' . implode( ' and ', $this->allowed_post_types ), array( 'status' => 400 ) );
		}

		if ( 'publish' !== \get_post_status( $request['id'] ) ) {
			return new WP_Error( 'invalid-post-status', 'You can only like ' . implode( ' and ', $this->allowed_post_types ) . ' that are published.', array( 'status' => 400 ) );
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
	 * @param int|\WP_Post|null $post Optional. Post ID or post object. Default is global $post.
	 *
	 * @return bool
	 */
	public function check_post_type( $post ) {
		return in_array( \get_post_type( $post ), $this->allowed_post_types, true );
	}

	/**
	 * Register javascript on front-end.
	 */
	public function register_scripts() {
		// Enqueue the plugin script & dependencies.
		\wp_enqueue_script(
			'rest-post-likes',
			\esc_url( \plugin_dir_url( __DIR__ ) . 'js/rest-post-likes.js' ),
			[ 'wp-api', 'underscore' ],
			'1.0',
			true
		);
		// Localize the plugin script.
		\wp_localize_script(
			'rest-post-likes',
			'restPostLikes',
			array_merge(
				$this->classnames,
				apply_filters( 'rest_post_likes_settings',
					[
						'storage_key'           => $this->meta_key,
						'endpoint_namespace'    => $this->namespace,
					]
				)
			)
		);
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
	 * @param int  $post_id WP_Post ID.
	 * @param bool $remove toggle to add or remove like.
	 *
	 * @return array $response
	 */
	public function handle_like( $post_id, $remove = false ) {
		$likes = absint( \get_post_meta( $post_id, $this->meta_key, true ) );
		$likes = $remove ? --$likes : ++$likes;
		$likes = max( $likes, 0 );

		\update_post_meta( $post_id, $this->meta_key, $likes );

		return [
			'count' => $likes,
		];
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
			return new WP_Error( 'invalid-post-type', 'You can only like ' . implode( ' and ', $this->allowed_post_types ), array( 'status' => 400 ) );
		}

		$button = sprintf( apply_filters( 'rest_post_likes_button_markup', '<button class="%1$s" data-post-id="%2$d">%3$s %4$s</button>' ),
			esc_attr( $this->classnames['button_classname'] ),
			\absint( $post_id ),
			apply_filters( 'rest_post_likes_button_text', 'Like ' ),
			$this->the_post_like_count( $post_id, [ 'echo' => false ] )
		);

		return $button;
	}

	/**
	 * Get like count on a post.
	 *
	 * @param int $post_id WP_Post ID.
	 *
	 * @return int|\WP_Error
	 */
	public function get_post_like_count( $post_id ) {

		if ( ! $this->check_post_type( $post_id ) ) {
			return new WP_Error( 'invalid-post-type', 'You can only like ' . implode( ' and ', $this->allowed_post_types ), array( 'status' => 400 ) );
		}

		return \absint( \get_post_meta( $post_id, 'rest_post_likes', true ) );
	}

	/**
	 * Get post like count with markup.
	 *
	 * @param int   $post_id WP_Post ID.
	 * @param array $args Array of arguments.
	 *
	 * @return string|void
	 */
	public function the_post_like_count( $post_id, $args = [] ) {
		if ( ! $this->check_post_type( $post_id ) ) {
			return new WP_Error( 'invalid-post-type', 'You can only like ' . implode( ' and ', $this->allowed_post_types ), array( 'status' => 400 ) );
		}

		$default = apply_filters( 'rest_post_likes_count_args', [ 'echo' => true ] );
		$args = wp_parse_args( $args, $default );

		$count = sprintf( apply_filters( 'rest_post_likes_count_markup', '<span class="%1$s" data-post-id="%2$d" data-post-likes="%3$d">%3$d</span>' ),
			esc_attr( $this->classnames['count_classname'] ),
			absint( $post_id ),
			esc_html( $this->get_post_like_count( $post_id ) )
		);

		if ( ! $args['echo'] ) {
			return $count;
		}

		echo $count;
	}

	/**
	 * Workaround for non-working DELETE requests.
	 *
	 * @link https://github.com/wearerequired/rest-post-likes/issues/5
	 *
	 * @param mixed            $result  Response to replace the requested version with. Can be anything
	 *                                  a normal endpoint can return, or null to not hijack the request.
	 * @param \WP_REST_Server  $server  Server instance.
	 * @param \WP_REST_Request $request Request used to generate the response.
	 *
	 * @return mixed|WP_REST_Response The modified response.
	 */
	public function rest_pre_dispatch( $result, $server, $request ) {
		remove_filter( current_filter(), __FUNCTION__ );

		$method = $request->get_method();
		$path   = $request->get_route();

		if ( WP_REST_Server::READABLE === $method && preg_match( '@^/' . $this->namespace . '/posts/(?P<id>[\d]+)/like$@i', $path ) ) {
			$request->set_method( WP_REST_Server::DELETABLE );

			return $server->dispatch( $request );
		}

		return $result;
	}
}
