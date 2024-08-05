<?php
/**
 * Renders the post like button block.
 */

declare( strict_types=1 );

?>

<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php echo get_rest_post_like_button( $block->context['postId'] ?? null ); ?>
</div>
