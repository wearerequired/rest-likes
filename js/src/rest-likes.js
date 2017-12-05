((( document, window, $, restLikes, wp ) => {
	/**
	 * Check for localStorage support in the browser.
	 */
	let storage;
	let fail;
	let uid;

	try {
		uid = new Date;
		(storage = window.localStorage).setItem( uid, uid );
		fail = storage.getItem( uid ) != uid;
		storage.removeItem( uid );
		fail && (storage = false);
	} catch ( exception ) {
	}

	/**
	 * Check for CustomEvent support in the browser.
	 *
	 * @url https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
	 */
	if ( typeof window.CustomEvent !== 'function' ) {
		function CustomEvent( event, params = { bubbles: false, cancelable: false, detail: undefined } ) {
			const evt = document.createEvent( 'CustomEvent' );
			evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
			return evt;
		}

		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent    = CustomEvent;
	}

	/**
	 * Get liked posts from localStorage.
	 *
	 * @returns {Array}
	 */
	const getLikedItems = objectType => {
		if ( storage ) {
			const storageData = storage.getItem( objectType );
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
	const addLikedItem = ( objectType, objectId ) => {
		if ( storage ) {
			let storageData = getLikedItems();
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
	const removeLikedItem = ( objectType, objectId ) => {
		if ( storage ) {
			let storageData = getLikedItems( objectType );
			storageData     = _.reject( storageData, num => num === objectId );
			storageData     = _.unique( storageData );
			storage.setItem( objectType, JSON.stringify( storageData ) );
		}
	};

	const checkButtons = () => {
		// Check localStorage for liked items, set class on the buttons.
		$( '[data-rest-like-button]' ).each( function() {
			const $this      = $( this );
			const type       = $this.data( 'type' );
			const classNames = restLikes.object_types[ type ].classnames;

			if ( $this.hasClass( classNames.liked ) ) {
				return;
			}

			if ( _.contains( getLikedItems( type ), $this.data( 'id' ) ) ) {
				$this.toggleClass( classNames.liked );
				$this.find( `.${classNames.label}` ).html( restLikes.object_types[ type ].texts.unlike );
			}
		} );
	};

	/**
	 *
	 * @param {string} objectType
	 * @param {number} objectId
	 */
	const buttonClickHandler = ( objectType, objectId ) => {
		// Get all buttons for that specific object.
		const $button = $( `[data-rest-like-button][data-type="${objectType}"][data-id="${objectId}"]` );

		const objectTypeData = restLikes.object_types[ objectType ];
		const classNames     = objectTypeData.classnames;

		// Set class while processing.
		$button.addClass( classNames.processing );

		// Define HTTP method.
		const method = $button.hasClass( classNames.liked ) ? 'DELETE' : 'POST';

		// Toggle the button class to show interaction.
		$button.toggleClass( classNames.liked );

		$.ajax( {
			url: restLikes.root + objectTypeData.endpoint.replace( '%s', objectId ),
			method,
			beforeSend( xhr ) {
				if ( restLikes.nonce ) {
					xhr.setRequestHeader( 'X-WP-Nonce', restLikes.nonce );
				}
			}
		} ).done( response => {
			// Remove processing class
			$button.removeClass( classNames.processing );

			$button.find( `.${classNames.count}` ).text( response.countFormatted ).attr( 'data-likes', response.count );

			if ( 'DELETE' === method ) {
				removeLikedItem( objectType, objectId );

				$button.find( `.${classNames.label}` ).html( objectTypeData.texts.like );

				wp.a11y.speak( restLikes.l10n.unlikeMsg.replace( '%s', response.count ), 'polite' );

				document.dispatchEvent( new CustomEvent( 'restLikes', {
					detail: {
						'action':         'unlike',
						'count':          response.count,
						'countFormatted': response.countFormatted,
						objectType,
						objectId,
					}
				} ) );
			} else {
				addLikedItem( objectType, objectId );

				$button.find( `.${classNames.label}` ).html( objectTypeData.texts.unlike );

				wp.a11y.speak( restLikes.l10n.likeMsg.replace( '%s', response.count ), 'polite' );

				document.dispatchEvent( new CustomEvent( 'restLikes', {
					detail: {
						'action':         'like',
						'count':          response.count,
						'countFormatted': response.countFormatted,
						objectType,
						objectId,
					}
				} ) );
			}
		} ).fail( () => {
			$button.toggleClass( classNames.liked ).removeClass( classNames.processing );

			wp.a11y.speak( restLikes.l10n.errorMsg, 'polite' );

			document.dispatchEvent( new CustomEvent( 'restLikes', {
				detail: {
					'action': 'error',
					objectType,
					objectId,
				}
			} ) );
		} );
	};

	/**
	 * Hook up the handler.
	 */
	$( document ).ready( () => {
		checkButtons();

		// Allow triggering a custom event to check buttons again.
		$( document.body ).on( 'restLikes', () => {
			checkButtons();
		} );

		$( document.body ).on( 'click', '[data-rest-like-button]', function() {
			buttonClickHandler( $( this ).data( 'type' ), $( this ).data( 'id' ) );
		} );
	} );
}))( document, window, jQuery, restLikes, wp );
