<?php

namespace Required\RestLikes\Tests;

use WP_REST_Request;
use WP_REST_Server;
use WP_UnitTestCase;
use Required\RestLikes\Posts;
use Required\RestLikes\Controller as RestLikesController;

class Controller extends WP_UnitTestCase {
	/**
	 * @var int
	 */
	protected static $post_id;

	/**
	 * @var RestLikesController
	 */
	protected $posts_controller;

	/**
	 * @var WP_REST_Server
	 */
	protected $server;

	public static function wpSetUpBeforeClass( $factory ) {
		self::$post_id = $factory->post->create();
	}

	public function setUp() {
		parent::setUp();

		$this->posts_controller = new Posts();

		/** @var WP_REST_Server $wp_rest_server */
		global $wp_rest_server;
		$this->server = $wp_rest_server = new \Spy_REST_Server();
	}

	public function tearDown() {
		parent::tearDown();

		/** @var WP_REST_Server $wp_rest_server */
		global $wp_rest_server;
		$wp_rest_server = null;
	}

	public function test_get_namespace() {
		$this->assertSame( 'rest-likes/v1', $this->posts_controller->get_namespace() );
	}

	public function get_allowed_post_types(  ) {
		
	}

	/**
	 * @covers RestLikesController::add_rest_field()
	 */
	public function test_adds_likes_field_to_rest_responses() {
		$this->posts_controller->add_hooks();
		do_action( 'rest_api_init' );

		$request  = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/' . self::$post_id );
		$response = $this->server->dispatch( $request );

		$this->assertArrayHasKey( $this->posts_controller->get_meta_key(), $response->get_data()['schema']['properties'] );
	}

	public function test_rest_field_get_callback() {
		$request = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/999' );

		$this->assertSame( 0, $this->posts_controller->rest_field_get_callback( $request ) );
	}

	public function test_get_rest_route_placeholder_really_contains_a_placeholder() {
		$this->assertSame( '/posts/%s/like', $this->posts_controller->get_rest_route_placeholder() );
	}

	/**
	 * @covers RestLikesController::transient_exists();
	 */
	public function test_cannot_like_twice() {
		$this->posts_controller->add_hooks();
		do_action( 'rest_api_init' );

		$like_count = $this->posts_controller->get_like_count( self::$post_id );

		$request_1  = new WP_REST_Request( 'POST', '/rest-likes/v1/posts/' . self::$post_id . '/like' );
		$response_1 = $this->server->dispatch( $request_1 );

		$request_2  = new WP_REST_Request( 'POST', '/rest-likes/v1/posts/' . self::$post_id . '/like' );
		$response_2 = $this->server->dispatch( $request_2 );

		$this->assertSame( 201, $response_1->get_status() );
		$this->assertSame( 400, $response_2->get_status() );
		$this->assertSame( $like_count + 1, $this->posts_controller->get_like_count( self::$post_id ) );
	}

	public function test_add_like() {
		$like_count = $this->posts_controller->get_like_count( self::$post_id );

		$response = $this->posts_controller->add_like( new WP_REST_Request( 'POST', '/rest-likes/v1/posts/' . self::$post_id . '/like' ) );
		$this->assertSame( $like_count + 1, $response->get_data()['count'] );
	}

	public function test_remove_like() {
		$like_count = $this->posts_controller->get_like_count( self::$post_id );

		$this->posts_controller->add_like( new WP_REST_Request( 'POST', '/rest-likes/v1/posts/' . self::$post_id . '/like' ) );
		$response = $this->posts_controller->remove_like( new WP_REST_Request( 'DELETE', '/rest-likes/v1/posts/' . self::$post_id . '/like' ) );
		$this->assertSame( $like_count, $response->get_data()['count'] );
	}

	public function test_like_no_negative_count() {
		$like_count = $this->posts_controller->get_like_count( self::$post_id );

		$response = $this->posts_controller->remove_like( new WP_REST_Request( 'DELETE', '/rest-likes/v1/posts/' . self::$post_id . '/like' ) );

		$this->assertSame( 0, $like_count );
		$this->assertGreaterThan( - 1, $response->get_data()['count'] );
	}
}
