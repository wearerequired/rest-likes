'use strict';

(function (document, window, $, restLikes, wp) {
	/**
  * Check for localStorage support in the browser.
  */
	var storage = void 0;
	var fail = void 0;
	var uid = void 0;

	try {
		uid = new Date();
		(storage = window.localStorage).setItem(uid, uid);
		fail = storage.getItem(uid) != uid;
		storage.removeItem(uid);
		fail && (storage = false);
	} catch (exception) {}

	/**
  * Check for CustomEvent support in the browser.
  *
  * @url https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
  */
	if (typeof window.CustomEvent !== 'function') {
		var _CustomEvent = function _CustomEvent(event) {
			var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { bubbles: false, cancelable: false, detail: undefined };

			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		};

		_CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = _CustomEvent;
	}

	/**
  * Get liked posts from localStorage.
  *
  * @returns {Array}
  */
	var getLikedItems = function getLikedItems(objectType) {
		if (storage) {
			var storageData = storage.getItem(objectType);
			if (storageData) {
				return JSON.parse(storageData);
			}
		}
		return [];
	};

	/**
  * Add like to localStorage.
  *
  * @param {string} objectType
  * @param {number} objectId
  */
	var addLikedItem = function addLikedItem(objectType, objectId) {
		if (storage) {
			var storageData = getLikedItems(objectType);
			if (storageData) {
				storageData.push(objectId);
				storageData = _.unique(storageData);
				storage.setItem(objectType, JSON.stringify(storageData));
			}
		}
	};

	/**
  * Remove like from localStorage.
  *
  * @param {string} objectType
  * @param {number} objectId
  */
	var removeLikedItem = function removeLikedItem(objectType, objectId) {
		if (storage) {
			var storageData = getLikedItems(objectType);
			storageData = _.reject(storageData, function (num) {
				return num === objectId;
			});
			storageData = _.unique(storageData);
			storage.setItem(objectType, JSON.stringify(storageData));
		}
	};

	var checkButtons = function checkButtons() {
		// Check localStorage for liked items, set class on the buttons.
		$('[data-rest-like-button]').each(function () {
			var $this = $(this);
			var objectType = $this.data('type');
			var classNames = restLikes.object_types[objectType].classnames;

			if ($this.hasClass(classNames.liked)) {
				return;
			}

			if (_.contains(getLikedItems(objectType), $this.data('id'))) {
				$this.toggleClass(classNames.liked);
				$this.find('.' + classNames.label).html(restLikes.object_types[objectType].texts.unlike);
			}
		});
	};

	/**
  * Button click handler.
  *
  * @param {string} objectType
  * @param {number} objectId
  */
	var buttonClickHandler = function buttonClickHandler(objectType, objectId) {
		// Get all buttons for that specific object.
		var $button = $('[data-rest-like-button][data-type="' + objectType + '"][data-id="' + objectId + '"]');

		var objectTypeData = restLikes.object_types[objectType];
		var classNames = objectTypeData.classnames;

		// Set class while processing.
		$button.addClass(classNames.processing);

		// Define HTTP method.
		var method = $button.hasClass(classNames.liked) ? 'DELETE' : 'POST';

		// Toggle the button class to show interaction.
		$button.toggleClass(classNames.liked);

		$.ajax({
			url: restLikes.root + objectTypeData.endpoint.replace('%s', objectId),
			method: method,
			beforeSend: function beforeSend(xhr) {
				if (restLikes.nonce) {
					xhr.setRequestHeader('X-WP-Nonce', restLikes.nonce);
				}
			}
		}).done(function (response) {
			// Remove processing class
			$button.removeClass(classNames.processing);

			$button.find('.' + classNames.count).text(response.countFormatted).attr('data-likes', response.count);

			if ('DELETE' === method) {
				removeLikedItem(objectType, objectId);

				$button.find('.' + classNames.label).html(objectTypeData.texts.like);

				wp.a11y.speak(restLikes.l10n.unlikeMsg.replace('%s', response.count), 'polite');

				document.dispatchEvent(new CustomEvent('restLikes', {
					detail: {
						'action': 'unlike',
						'count': response.count,
						'countFormatted': response.countFormatted,
						objectType: objectType,
						objectId: objectId
					}
				}));
			} else {
				addLikedItem(objectType, objectId);

				$button.find('.' + classNames.label).html(objectTypeData.texts.unlike);

				wp.a11y.speak(restLikes.l10n.likeMsg.replace('%s', response.count), 'polite');

				document.dispatchEvent(new CustomEvent('restLikes', {
					detail: {
						'action': 'like',
						'count': response.count,
						'countFormatted': response.countFormatted,
						objectType: objectType,
						objectId: objectId
					}
				}));
			}
		}).fail(function () {
			$button.toggleClass(classNames.liked).removeClass(classNames.processing);

			wp.a11y.speak(restLikes.l10n.errorMsg, 'polite');

			document.dispatchEvent(new CustomEvent('restLikes', {
				detail: {
					'action': 'error',
					objectType: objectType,
					objectId: objectId
				}
			}));
		});
	};

	/**
  * Heartbeat API.
  */
	$(document).on('heartbeat-send', function (event, data) {
		data.rest_likes = {};
		_.each(_.keys(restLikes.object_types), function (objectType) {
			data.rest_likes[objectType] = _.unique($('[data-rest-like-button][data-type="' + objectType + '"]').map(function (i, e) {
				return $(e).attr('data-id');
			}));
		});
	});

	$(document).on('heartbeat-tick', function (event, data) {
		if (!data.rest_likes) {
			return;
		}

		_.each(data.rest_likes, function (item) {
			var objectType = item.objectType,
			    objectId = item.objectId,
			    count = item.count,
			    countFormatted = item.countFormatted;

			var objectTypeData = restLikes.object_types[objectType];
			var classNames = objectTypeData.classnames;

			$('[data-rest-like-button][data-type="' + objectType + '"][data-id="' + objectId + '"]').find('.' + classNames.count).text(countFormatted).attr('data-likes', count);
		});
	});

	/**
  * Hook up the handler.
  */
	$(document).ready(function () {
		checkButtons();

		// Allow triggering a custom event to check buttons again.
		$(document.body).on('restLikes', function () {
			checkButtons();
		});

		$(document.body).on('click', '[data-rest-like-button]', function () {
			buttonClickHandler($(this).data('type'), $(this).data('id'));
		});
	});
})(document, window, jQuery, restLikes, wp);