# REST Post Likes

A WordPress plugin to capture likes from users using the WP REST API.

## What it does

* Creates a custom endpoint `/rest-post-likes/v1/posts/<post_id>/like` which allows users with a valid `wp_rest` nonce to `POST` and `DELETE` likes on post types (default: `post|page`).
* Provides template tags to render the post like count `get_rest_post_like_count( $post_id )` & `the_rest_post_like_count( $post_id )`. The second one provides markup around the count.

### Example implementaion

The following example code adds the post like count at the beginning of `the_content` and the post like button with count at the end of `the_content`:

```php
add_filter( 'the_content', function( $content ) {
	if ( is_singular( get_rest_post_like_allowed_post_types() ) ) {
		$content = the_rest_post_like_count( get_the_ID(), [ 'echo' => false ] ) . $content;
		$content = $content . get_rest_post_like_button( get_the_ID() );
	}
	return $content;
} );
```

This is pretty basic and would look something like this:

![Example implementation screenshot](https://www.dropbox.com/s/y747q142g3e8zyl/Screenshot%202016-10-13%2017.58.24.png?dl=1)

## Hooks aka Actions & Filters

The plugin provides a few hooks to customize certain parts to your needs.

### `rest_post_likes_namespace` filter hook

Change the namespace in of the plugin endpoint.

* **default:** `rest-post-likes`

```php
add_filter( 'rest_post_likes_namespace’, function( $name ) {
	return 'another-end-point-namespace’;
});
```

### `rest_post_likes_allowed_post_types` filter hook

Change the post types that support likes.

* **default:** `[ 'post', 'page' ]`

```php
add_filter( 'rest_post_likes_allowed_post_types’, function( $post_types ) {
	return ['post'] // Allow likes on posts
	return $post_types[] = 'my-cpt-name' // Add another post type
});
```

### `rest_post_likes_classnames` filter hook

Change the CSS classnames used by the like count, button and already liked posts.

* **default:** `[ 'count_classname' => 'rest-like-count', 'button_classname' => 'rest-like-button', 'liked_classname' => 'has-like' ]`

```php
add_filter( 'rest_post_likes_classnames’, function( $classnames ) {
	$classnames['count_classname'] = 'fancy-like-count';
	$classnames['button_classname'] = 'fancy-like-button';
	$classnames['liked_classname'] = 'fancy-like-has';
	return $classnames;
});
```

### `rest_post_likes_button_text` filter hook

Change the text of the like button, sort of the inner part of the button, with the count appended automatically.

* **default:** `Like `

```php
add_filter( 'rest_post_likes_button_text', function( $button_text ) {
	$button_text = '<span class="icon-thumb-up"></span>';
	return $button_text;
});
```

### `rest_post_likes_button_markup` filter hook

Change the markup of the button entirely.

* **default:** `<button class="%1$s" data-post-id="%2$d">%3$s %4$s</button>`
* string `%1$s` the CSS classnames
* int `%2$d` the Post ID
* string `%3$s` button text
* string `%4$s` like count

```php
add_filter( 'rest_post_likes_button_markup', function( $markup ) {
	return '<span class="%1$s" data-post-id="%2$d">%4$s</span>';
});
```

### `rest_post_likes_count_markup` filter hook

Change the markup of the count element.

* **default:** `<span class="%1$s">%2$d</span>`
* string `%1$s` the CSS classnames
* int `%2$d` current like count

```php
add_filter( 'rest_post_likes_count_markup', function( $markup ) {
	return 'Likes so far: <span class="%1$s">%2$d</span>';
});
```