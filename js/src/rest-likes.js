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
	 * Polyfill for Array.prototype.includes.
	 *
	 * That method is not available in Internet Explorer, thus the polyfill is needed.
	 *
	 * It uses Object.defineProperty, which is available in Internet Explorer 9 and newer.
	 *
	 * @url https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
	 * @url https://tc39.github.io/ecma262/#sec-array.prototype.includes
	 */
	if ( !Array.prototype.includes ) {
		Object.defineProperty( Array.prototype, 'includes', {
			value: function ( searchElement, fromIndex ) {
				if ( this == null ) {
					throw new TypeError( '"this" is null or not defined' );
				}

				// 1. Let O be ? ToObject(this value).
				const o = Object( this );

				// 2. Let len be ? ToLength(? Get(O, "length")).
				const len = o.length >>> 0;

				// 3. If len is 0, return false.
				if ( len === 0 ) {
					return false;
				}

				// 4. Let n be ? ToInteger(fromIndex).
				//    (If fromIndex is undefined, this step produces the value 0.)
				const n = fromIndex | 0;

				// 5. If n ≥ 0, then
				//  a. Let k be n.
				// 6. Else n < 0,
				//  a. Let k be len + n.
				//  b. If k < 0, let k be 0.
				let k = Math.max( n >= 0 ? n : len - Math.abs( n ), 0 );

				function sameValueZero( x, y ) {
					return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN( x ) && isNaN( y ));
				}

				// 7. Repeat, while k < len
				while ( k < len ) {
					// a. Let elementK be the result of ? Get(O, ! ToString(k)).
					// b. If SameValueZero(searchElement, elementK) is true, return true.
					if ( sameValueZero( o[ k ], searchElement ) ) {
						return true;
					}
					// c. Increase k by 1.
					k++;
				}

				// 8. Return false
				return false;
			}
		} );
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
			let storageData = getLikedItems( objectType );
			if ( storageData ) {
				storageData.push( objectId );
				storageData = [ ...new Set( storageData ) ];
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
			storageData     = storageData.filter( num => num === objectId );
			storageData     = [ ...new Set( storageData ) ];
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

			if ( getLikedItems( type ).includes( $this.data( 'id' ) ) ) {
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
