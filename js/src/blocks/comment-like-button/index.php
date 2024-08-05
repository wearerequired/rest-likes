<?php
/**
 * Renders the comment like button block.
 */

declare( strict_types=1 );

?>

<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php echo get_rest_comment_like_button( $block->context['commentId'] ?? null ); ?>
</div>
