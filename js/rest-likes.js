(function( $, restLikes, wp ) {
	/**
	 * Check for localStorage support in the browser.
	 */
	var storage, fail, uid;
	try {
		uid = new Date;
		(storage = window.localStorage).setItem( uid, uid );
		fail = storage.getItem( uid ) != uid;
		storage.removeItem( uid );
		fail && (storage = false);
	} catch ( exception ) {
	}

	/**
	 * Get liked posts from localStorage.
	 *
	 * @returns {Array}
	 */
	var getLikedItems = function( objectType ) {
		if ( storage ) {
			var storageData = storage.getItem( objectType );
			if ( storageData ) {
				return JSON.parse( storageData );
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
	var addLikedItem = function( objectType, objectId ) {
		if ( storage ) {
			var storageData = getLikedItems();
			if ( storageData ) {
				storageData.push( objectId );
				storageData = _.unique( storageData );
				storage.setItem( objectType, JSON.stringify( storageData ) );
			}
		}
	};

	/**
	 * Remove like from localStorage.
	 *
	 * @param {string} objectType
	 * @param {number} objectId
	 */
	var removeLikedItem = function( objectType, objectId ) {
		if ( storage ) {
			var storageData = getLikedItems( objectType );
			storageData     = _.reject( storageData, function( num ) {
				return num === objectId
			} );
			storageData     = _.unique( storageData );
			storage.setItem( objectType, JSON.stringify( storageData ) );
		}
	};

	var checkButtons = function() {
		// Check localStorage for liked items, set class on the buttons.
		$( '[data-rest-like-button]' ).each( function() {
			var $this      = $( this ),
			    type       = $this.data( 'type' ),
			    classNames = restLikes.object_types[ type ].classnames;

			if ( $this.hasClass( classNames.liked ) ) {
				return;
			}

			if ( _.contains( getLikedItems( type ), $this.data( 'id' ) ) ) {
				$this.toggleClass( classNames.liked );
				$this.find( '.' + classNames.label ).html( restLikes.object_types[ type ].texts.unlike );
			}
		} );
	};

	/**
	 *
	 * @param {string} objectType
	 * @param {number} objectId
	 */
	var buttonClickHandler = function( objectType, objectId ) {
		// Get all buttons for that specific object.
		var $button    = $( '[data-rest-like-button][data-type="' + objectType + '"][data-id="' + objectId + '"]' ),
		    objectType = restLikes.object_types[ objectType ],
		    classNames = objectType.classnames;

		// Set class while processing.
		$button.addClass( classNames.processing );

		// Define HTTP method.
		var method = $button.hasClass( classNames.liked ) ? 'DELETE' : 'POST';

		// Toggle the button class to show interaction.
		$button.toggleClass( classNames.liked );

		$.ajax( {
			url:    restLikes.root + objectType.endpoint.replace( '%s', objectId ),
			method: method,
			beforeSend: function( xhr ) {
				if ( restLikes.nonce ) {
					xhr.setRequestHeader( 'X-WP-Nonce', restLikes.nonce );
				}
			}
		} ).done( function( response ) {
			// Remove processing class
			$button.removeClass( classNames.processing );

			$button.find( '.' + classNames.count ).text( response.countFormatted ).attr( 'data-likes', response.count );

			if ( 'DELETE' === method ) {
				removeLikedItem( objectType, objectId );

				$button.find( '.' + classNames.label ).html( objectType.texts.like );

				wp.a11y.speak( restLikes.l10n.unlikeMsg.replace( '%s', response.count ), 'polite' );
			} else {
				addLikedItem( objectType, objectId );

				$button.find( '.' + classNames.label ).html( objectType.texts.unlike );

				wp.a11y.speak( restLikes.l10n.likeMsg.replace( '%s', response.count ), 'polite' );
			}
		} ).fail( function() {
			$button.toggleClass( classNames.liked ).removeClass( classNames.processing );

			wp.a11y.speak( restLikes.l10n.errorMsg, 'polite' );
		} );
	};

	/**
	 * Hook up the handler.
	 */
	$( document ).ready( function() {
		checkButtons();

		// Allow triggering a custom event to check buttons again.
		$( document.body ).on( 'restLikes', function() {
			checkButtons();
		} );

		$( document.body ).on( 'click', '[data-rest-like-button]', function() {
			buttonClickHandler( $( this ).data( 'type' ), $( this ).data( 'id' ) );
		} );
	} );
})( jQuery, window.restLikes, wp );
