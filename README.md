<table width="100%">
	<tr>
		<td align="left" width="70%">
			<strong>REST Likes</strong><br />
			Like posts, comments, or any other object type via the REST API.
		</td>
		<td align="right" width="30%">
			<a href="https://travis-ci.org/wearerequired/rest-likes">
				<img src="https://travis-ci.org/wearerequired/rest-likes.svg?branch=master" alt="Build Status" />
			</a>
			<br />
			<a href="https://codecov.io/gh/wearerequired/rest-likes?branch=master">
				<img src="https://codecov.io/gh/wearerequired/rest-likes/coverage.svg?branch=master" alt="Coverage via Codecov" />
			</a>
			<br />
			<a href="https://codeclimate.com/github/wearerequired/rest-likes">
				<img src="https://codeclimate.com/github/wearerequired/rest-likes/badges/gpa.svg" />
			</a>
		</td>
	</tr>
	<tr>
		<td>
			Made with ❤️ by <a href="https://required.com/"><strong>required</strong></a>.
		</td>
		<td align="center">
			<img src="https://required.com/content/themes/required-valencia/img/logo-required.svg" width="100" />
		</td>
	</tr>
</table>

# REST Likes

A WordPress plugin to capture likes from users using the WP REST API. Supports posts, comments, and basically any other object type.

It does so by adding custom endpoints under the  `/rest-likes/v1` namespace to allow users to like (`POST`) and unlike (`DELETE`) a given object.

## Template Tags

The plugin provides template tags for retrieving the post like count or even the complete markup for the like button. For posts it'd look like this:

| Function                           | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `get_rest_post_like_count( 123 )`  | Returns the raw like count for the post with the ID `123`. |
| `the_rest_post_like_count()`       | Prints the like count markup for the current post. The number inside is properly formatted using `number_format_i18n()` |
| `get_rest_post_like_button( 123 )` | Returns the like button markup for the post with the ID `123`. |
| `the_rest_post_like_button()`      | Prints the like button markup for the current post. |

## Example Usage

By default, the plugin doesn't display any like button on the front end by itself.

The following example code adds the post like count at the beginning of `the_content` and the post like button with count at the end of `the_content`:

```php
add_filter( 'the_content', function( $content ) {
	return get_rest_post_like_count() . $content . get_rest_post_like_button();
} );
```

This is pretty basic and would look something like this:

![Example implementation screenshot](https://www.dropbox.com/s/y747q142g3e8zyl/Screenshot%202016-10-13%2017.58.24.png?dl=1)

As you can see, now default styling is provided.

## Hooks & Filters

The plugin provides a few hooks to customize certain parts to your needs.

### `rest_likes.enabled_object_types` Filter

Allows you to filter the list of object types likes are allowed for. In this associative array, the object type is the key, while the value is the name of a class extending `\Required\RestLikes\Controller`

* **Default:** `[ 'post', 'comment' ]`

```php
add_filter( 'rest_likes.rest_likes.enabled_object_types', function( $object_types ) {
	unset( $object_types['comment'] );

	return $object_types;
} );
```

### `rest_likes.allowed_post_types` Filter

Allows you to filter the list of post types likes are allowed for.

* **Default:** `[ 'post', 'page' ]`

```php
add_filter( 'rest_likes.allowed_post_types', function( $post_types ) {
	$post_types[] = 'foo' // Allow the 'foo' post type.

	return $post_types;
} );
```

### `rest_likes.script_data` Filter

Allows you to filter the daa that is sent to the JavaScript, e.g. the URL to the REST API.

* **Default:** `[ 'root' => …, 'object_types' => … ]`

```php
add_filter( 'rest_likes.script_data', function( $script_data ) {
	$script_data['foo'] = 'bar';

 	return $script_data;
} );
```



### `rest_rest_likes.classnames` Filter

Change the CSS classnames used inside the like count/button markup.

* **Default:** `[ 'count_classname' => 'rest-like-count', 'button_classname' => 'rest-like-button', 'liked_classname' => 'has-like', 'processing' => 'rest-like-processing' ]`

```php
add_filter( 'rest_rest_likes.classnames', function( $classnames ) {
	$classnames['count_classname'] = 'fancy-like-count';
	$classnames['button_classname'] = 'fancy-like-button';

	return $classnames;
} );
```

### `rest_likes.button_markup` Filter

Allows you to change the entire markup of the button.

- **Default:** `<button class="%1$s" data-type="%2$s" data-id="%3$d" data-rest-like-button>%4$s %5$s</button>`
- `%1$s`: The CSS classnames
- `%2$s`: The object type (post, comment, etc)
- `%3$d`: Object ID
- `%4$s`: Button text
- `%5$s`: Formatted ike count

```php
add_filter( 'rest_likes.button_markup', function( $markup ) {
	return '<span class="%1$s" data-post-id="%2$d">%4$s</span>';
} );
```

### `rest_likes.button_text` Filter

Change the text inside the like button.

* **Default:** `Like `

```php
add_filter( 'rest_likes.button_text', function( $button_text ) {
	$button_text = '<span class="icon-thumb-up"></span>';
 
	return $button_text;
} );
```

### `rest_likes.count_markup` Filter

Change the markup of the count element.

* **Default:** `<span class="%1$s" data-type="%2$s" data-id="%3$d" data-likes="%4$d">%5$s</span>`
* `%1$s`: The CSS classnames
* `%2$s`: The object type (post, comment, etc)
* `%3$d`: Object ID
* `%4$d`: Like count
* `%5$s`: Formatted ike count

```php
add_filter( 'rest_likes.count_markup', function( $markup ) {
	return sprintf( __( 'Likes so far: %s', 'myplugin' ), $markup );
} );
```