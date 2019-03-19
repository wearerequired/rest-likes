# REST Likes

A WordPress plugin to capture likes from users using the WP REST API. Supports posts, comments, and basically any other object type.

It does so by adding custom endpoints under the  `/rest-likes/v1` namespace to allow users to like (`POST`) and unlike (`DELETE`) a given object.

## Installation

To install, use composer:

```
composer require wearerequired/rest-likes
```

## Documentation

Check out [the wiki](https://github.com/wearerequired/rest-likes/wiki) for usage examples and further documentation.