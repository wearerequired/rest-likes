( function( $ ) {
	var button     = $( '.' + restPostLikes.button_classname ),
	    storageKey = restPostLikes.storage_key;

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

		// Set up the post_id of the current post.
		var post_id = button.data( 'post-id' );

		// Check localStorage for liked post, set class on button.
		if ( _.contains( getLikedPosts(), post_id ) ) {
			button.toggleClass( restPostLikes.liked_classname );
		}

		button.on( 'click', function () {
			// Set class while processing
			button.addClass( restPostLikes.processing_classname );

			// Define default HTTP method.
			var method = 'POST';

			// Alter method if the user already liked the post.
			if ( button.hasClass( restPostLikes.liked_classname ) ) {
				method = 'DELETE';
			}

			// Toggle the button class to show interaction.
			button.toggleClass( restPostLikes.liked_classname );

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
					button.removeClass( restPostLikes.processing_classname );

					$( '.' + restPostLikes.count_classname + '[data-post-id="' + post_id + '"]' ).text( response.count );
			} ).fail( function () {
					// Toggle the button class to show interaction.
					button.toggleClass( restPostLikes.liked_classname );
					// Remove processing class
					button.removeClass( restPostLikes.processing_classname );
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