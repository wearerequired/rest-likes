# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
* Remove browser support for IE 11.

## [1.1.0] - 2022-11-07

### Added
* Introduce `rest_likes.request_rejected` action.
* Expose some JavaScript functions as an API to be able to override them.
* Use MutationObserver to check for new like buttons and their status.

### Fixed
* Use jQuery to listen to heartbeat actions.

## [1.0.0] - 2018-12-08

### Added
* REST API endpoint to capture likes from users for posts, comments, and basically any other object type.

[Unreleased]: https://github.com/wearerequired/rest-likes/compare/1.1.0...HEAD
[1.0.0]: https://github.com/wearerequired/rest-likes/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/wearerequired/rest-likes/compare/a7da73ada3...1.0.0
