<?php

namespace Required\RestLikes\Tests;

use WP_UnitTestCase;

class Plugin extends WP_UnitTestCase {
	public function test_plugin_is_activated() {
		$this->assertTrue( class_exists( 'Required\\RestLikes\\Plugin' ) );
	}

	public function test_get_like_count_invalid_object_type() {
		$this->assertSame( 0, rest_likes()->get_like_count( 'foo', 123 ) );
	}

	public function test_get_like_count_html_invalid_object_type() {
		$this->assertSame( '', rest_likes()->get_like_count_html( 'foo', 123 ) );
	}

	public function test_get_like_button_invalid_object_type() {
		$this->assertSame( '', rest_likes()->get_like_button( 'foo', 123 ) );
	}
}
