<?php
/**
 * Blocks namespaced functions.
 */

declare( strict_types=1 );

namespace Required\RestLikes\Blocks;

/**
 * Inits plugin.
 */
function bootstrap(): void {
	add_action( 'init', __NAMESPACE__ . '\register_assets' );
	add_action( 'init', __NAMESPACE__ . '\register_block_types' );
}

/**
 * Registers block types.
 */
function register_block_types(): void {
	$block_json_files = glob( REST_LIKES_PLUGIN_DIR . '/js/dist/*-block.json' );
	if ( \is_array( $block_json_files ) ) {
		foreach ( $block_json_files as $block_json_file ) {
			register_block_type_from_metadata( $block_json_file );
		}
	}
}

/**
 * Registers scripts and styles used by blocks.
 */
function register_assets(): void {
	$blocks_script_asset = require REST_LIKES_PLUGIN_DIR . '/js/dist/blocks.asset.php';

	wp_register_script(
		'rest-likes-blocks-editor',
		plugins_url( 'js/dist/blocks.js', REST_LIKES_PLUGIN_FILE ),
		$blocks_script_asset['dependencies'],
		$blocks_script_asset['version'],
		true
	);

	wp_set_script_translations( 'rest-likes-blocks-editor', 'rest-likes' );

	if ( file_exists( REST_LIKES_PLUGIN_DIR . '/js/dist/blocks.css' ) ) {
		wp_register_style(
			'rest-likes-blocks-editor',
			plugins_url( 'js/dist/blocks.css', REST_LIKES_PLUGIN_FILE ),
			[],
			filemtime( REST_LIKES_PLUGIN_DIR . '/js/dist/blocks.css' )
		);
	}
}
