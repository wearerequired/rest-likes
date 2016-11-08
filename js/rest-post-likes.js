/* global restPostLikes */
( function( $ ) {
	var storageKey = restPostLikes.storage_key;

	/**
	 * Check for localStorage support in the browser.
	 */
	var storage, fail, uid;
	try {
		uid = new Date;
		(storage = window.localStorage).setItem(uid, uid);
		fail = storage.getItem(uid) != uid;
		storage.removeItem(uid);
		fail && (storage = false);
	} catch (exception) {}

	/**
	 * Get liked posts from localStorage.
	 *
	 * @returns {Array}
	 */
	var getLikedPosts = function () {
		if ( storage ) {
			var storageData = storage.getItem( storageKey );
			if ( storageData ) {
				return JSON.parse( storageData );
			}
		}
		return [];
	};

	/**
	 * Add like to localPost.
	 *
	 * @param post_id
	 */
	var addLikedPosts = function ( post_id ) {
		if ( storage ) {
			var storageData = getLikedPosts();
			if ( storageData ) {
				storageData.push( post_id );
				storageData = _.uniq( storageData );
				storage.setItem( storageKey, JSON.stringify( storageData ) );
			}
		}
	};

	/**
	 * Remove like from localStorage.
	 *
	 * @param post_id
	 */
	var removeLikedPost = function ( post_id ) {
		if ( storage ) {
			var storageData = getLikedPosts();
			storageData = _.reject( storageData, function( num ) { return num === post_id } );
			storageData = _.uniq( storageData );
			storage.setItem( storageKey, JSON.stringify( storageData ) );
		}
	};

	var buttonHandler = function () {
		var $buttons = $( '.' + restPostLikes.button_classname );

		// Check localStorage for liked posts, set class on the buttons.
		$buttons.each( function() {
			var $this = $( this );

			if ( $this.hasClass( restPostLikes.liked_classname ) ) {
				return;
			}

			if ( _.contains( getLikedPosts(), $this.data( 'post-id' ) ) ) {
				$this.toggleClass( restPostLikes.liked_classname );
			}
		} );

		$buttons.on( 'click', function () {
			var post_id = $( this ).data( 'post-id' ),
			    $button = $( '.' + restPostLikes.button_classname + '[data-post-id="' + post_id + '"]' );

			// Set class while processing
			$button.addClass( restPostLikes.processing_classname );

			// Define HTTP method.
			var method = $button.hasClass( restPostLikes.liked_classname ) ? 'DELETE' : 'POST';

			// Toggle the button class to show interaction.
			$button.toggleClass( restPostLikes.liked_classname );

			$.ajax( {
				url: wpApiSettings.root + restPostLikes.endpoint_namespace + '/posts/' + post_id + '/like',
				method: method,
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
				}
			} ).done( function ( response ) {
				if ( 'DELETE' === method ) {
					removeLikedPost( post_id );
				} else {
					addLikedPosts( post_id );
				}

				// Remove processing class
				$button.removeClass( restPostLikes.processing_classname );

				$( '.' + restPostLikes.count_classname + '[data-post-id="' + post_id + '"]' ).text( response.count );
			} ).fail( function() {
				// Toggle the button class to show interaction.
				$button.toggleClass( restPostLikes.liked_classname );
				// Remove processing class
				$button.removeClass( restPostLikes.processing_classname );
			} );
		});
	};

	/**
	 * Hook up the handler.
	 */
	$( document ).ready( function () {
		buttonHandler();
	});

})( jQuery );