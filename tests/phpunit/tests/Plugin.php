<?php

namespace Required\RestLikes\Tests;

use WP_UnitTestCase;

class Plugin extends WP_UnitTestCase {
	public function test_plugin_is_activated() {
		$this->assertTrue( class_exists( 'Required\\RestLikes\\Plugin' ) );
	}
}
