/**
 * External dependencies.
 */
import jQuery from 'jquery';
import { speak } from '@wordpress/a11y';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Check for localStorage support in the browser.
 */
let storage;
let fail;
let uid;

try {
	uid = new Date().getTime().toString();
	( storage = window.localStorage ).setItem( uid, uid );
	fail = storage.getItem( uid ) !== uid;
	storage.removeItem( uid );
	if ( fail ) {
		storage = false;
	}
} catch ( exception ) {}

const api = ( window.RestLikesApi = {} );

/**
 * Get liked posts from localStorage.
 *
 * @param {string} objectType
 * @return {Array} Liked posts.
 */
const getLikedItems = ( objectType ) => {
	if ( storage ) {
		const storageData = storage.getItem( `rest-likes-${ objectType }` );
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
			storageData.push( parseInt( objectId, 10 ) );
			storageData = [ ...new Set( storageData ) ];
			storage.setItem( `rest-likes-${ objectType }`, JSON.stringify( storageData ) );
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
		storageData = storageData.filter( ( num ) => num !== parseInt( objectId, 10 ) );
		storageData = [ ...new Set( storageData ) ];
		storage.setItem( `rest-likes-${ objectType }`, JSON.stringify( storageData ) );
	}
};

/**
 * Determines whether an item has been liked already or not.
 *
 * @param {string} objectType
 * @param {number} objectId
 */
const isLikedItem = ( objectType, objectId ) => {
	return -1 !== getLikedItems( objectType ).indexOf( parseInt( objectId, 10 ) );
};

/**
 * Checks status of a like button.
 *
 * @param {Node} likeButton
 */
const checkButton = ( likeButton ) => {
	const objectType = likeButton.getAttribute( 'data-type' );
	const objectTypeData = window.restLikes.object_types[ objectType ];
	const classNames = objectTypeData.classnames;

	if ( likeButton.classList.contains( classNames.liked ) ) {
		return;
	}

	const objectId = likeButton.getAttribute( 'data-id' );
	if ( isLikedItem( objectType, objectId ) ) {
		likeButton.classList.add( classNames.liked );
		likeButton.querySelector( `.${ classNames.label }` ).innerHTML =
			objectTypeData.texts.unlike;
	}
};

/**
 * Initially checks the status of every available like button on the page.
 */
const checkButtons = () => {
	// Check localStorage for liked items, set class on the buttons.
	const likeButtons = document.querySelectorAll( '[data-rest-like-button]' );

	likeButtons.forEach( ( likeButton ) => checkButton( likeButton ) );
};

/**
 * Update the like button count.
 * @param {HTMLButtonElement} likeButtonCount  The like button count
 * @param {number}            count            The count as a number
 * @param {string}            countFormatted   The count as formatted number for reading
 * @param {string}            screenReaderText A screenreader text calculated with PHP.
 */
const updateLikeButtonCount = ( likeButtonCount, count, countFormatted, screenReaderText ) => {
	const likeButtonSpanVisual = likeButtonCount.querySelector( '[aria-hidden]' );
	const likeButtonSpanScreenReader = likeButtonCount.querySelector( '.screen-reader-text' );

	if ( ! likeButtonSpanVisual || ! likeButtonSpanScreenReader ) {
		return;
	}

	likeButtonSpanVisual.textContent = countFormatted;
	likeButtonSpanScreenReader.textContent =
		1 === count ? screenReaderText : sprintf( screenReaderText, countFormatted );

	likeButtonCount.setAttribute( 'data-likes', count );
};

/**
 * Sends request to API.
 *
 * @param {string}  objectType
 * @param {number}  objectId
 * @param {boolean} isLike
 */
api.request = ( objectType, objectId, isLike ) => {
	const objectTypeData = window.restLikes.object_types[ objectType ];

	return window.fetch(
		window.restLikes.root + objectTypeData.endpoint.replace( '%s', objectId ),
		{
			method: isLike ? 'DELETE' : 'POST',
			headers: window.restLikes.nonce && {
				'X-WP-Nonce': window.restLikes.nonce,
			},
			credentials: 'include',
		}
	);
};

/**
 * Button click handler.
 *
 * @param {string} objectType
 * @param {number} objectId
 */
api.buttonClickHandler = ( objectType, objectId ) => {
	// Get all buttons for that specific object.
	const likeButtons = document.querySelectorAll(
		`[data-rest-like-button][data-type="${ objectType }"][data-id="${ objectId }"]`
	);

	const objectTypeData = window.restLikes.object_types[ objectType ];
	const classNames = objectTypeData.classnames;

	likeButtons.forEach( ( likeButton ) => {
		// Set class while processing.
		likeButton.classList.add( classNames.processing );
	} );

	const likedItem = isLikedItem( objectType, objectId );

	api.request( objectType, objectId, likedItem )
		.then( ( response ) => {
			// Support other `request` implementations which don't return a Response object
			// like jQuery.ajax().
			if ( window.Response && response instanceof Response ) {
				if ( ! response.ok ) {
					throw Error( response.statusText );
				}

				return response.json();
			} else if ( 'object' === typeof response ) {
				return response;
			}
			throw Error( 'Unknown response' );
		} )
		.then( ( response ) => {
			likeButtons.forEach( ( likeButton ) => {
				likeButton.classList.remove( classNames.processing );

				const likeButtonCount = likeButton.querySelector( `.${ classNames.count }` );
				updateLikeButtonCount(
					likeButtonCount,
					response.count,
					response.countFormatted,
					response.screenReaderText
				);
			} );

			if ( likedItem ) {
				removeLikedItem( objectType, objectId );

				likeButtons.forEach( ( likeButton ) => {
					likeButton.classList.remove( classNames.liked );
					likeButton.querySelector( `.${ classNames.label }` ).innerHTML =
						objectTypeData.texts.like;
				} );

				speak( sprintf( likeButtons[ 0 ].dataset.speakUnlike, response.count ) ); // eslint-disable-line @wordpress/valid-sprintf

				document.dispatchEvent(
					new CustomEvent( 'restLikes', {
						detail: {
							action: 'unlike',
							count: response.count,
							countFormatted: response.countFormatted,
							screenReaderText: response.screenReaderText,
							objectType,
							objectId,
						},
					} )
				);

				return;
			}

			if ( ! likedItem ) {
				addLikedItem( objectType, objectId );

				likeButtons.forEach( ( likeButton ) => {
					likeButton.classList.add( classNames.liked );
					likeButton.querySelector( `.${ classNames.label }` ).innerHTML =
						objectTypeData.texts.unlike;
				} );

				speak( sprintf( likeButtons[ 0 ].dataset.speakLike, response.count ) ); // eslint-disable-line @wordpress/valid-sprintf

				document.dispatchEvent(
					new CustomEvent( 'restLikes', {
						detail: {
							action: 'like',
							count: response.count,
							countFormatted: response.countFormatted,
							screenReaderText: response.screenReaderText,
							objectType,
							objectId,
						},
					} )
				);
			}
		} )
		.catch( ( error ) => {
			likeButtons.forEach( ( likeButton ) => {
				likeButton.classList.remove( classNames.processing );
			} );

			console.error( error ); // eslint-disable-line no-console
			speak( __( 'There was an error processing your request.', 'rest-likes' ) );

			document.dispatchEvent(
				new CustomEvent( 'restLikes', {
					detail: {
						action: 'error',
						objectType,
						objectId,
					},
				} )
			);
		} );
};

// We need jQuery do listen to custom events triggered by jQuery, see https://bugs.jquery.com/ticket/11047.
const $document = jQuery( document );

/**
 * Sends a list of items for Heartbeat calls.
 */
$document.on( 'heartbeat-send', ( event, data ) => {
	data.rest_likes = {};

	Object.keys( window.restLikes.object_types ).forEach( ( objectType ) => {
		const likeButtons = document.querySelectorAll(
			`[data-rest-like-button][data-type="${ objectType }"]`
		);
		const objectIds = [];

		likeButtons.forEach( ( likeButton ) => {
			objectIds.push( likeButton.getAttribute( 'data-id' ) );
		} );

		// Makes the list of object IDs unique.
		data.rest_likes[ objectType ] = [ ...new Set( objectIds ) ];
	} );
} );

/**
 * Listens to Heartbeat ticks and updates like counts for all received items.
 */
$document.on( 'heartbeat-tick', ( event, data ) => {
	if ( ! data.rest_likes ) {
		return;
	}

	for ( const item of data.rest_likes ) {
		const { objectType, objectId, count, countFormatted, screenReaderText } = item;
		const objectTypeData = window.restLikes.object_types[ objectType ];
		const classNames = objectTypeData.classnames;

		const likeButtons = document.querySelectorAll(
			`[data-rest-like-button][data-type="${ objectType }"][data-id="${ objectId }"]`
		);

		likeButtons.forEach( ( likeButton ) => {
			const likeButtonCount = likeButton.querySelector( `.${ classNames.count }` );

			updateLikeButtonCount( likeButtonCount, count, countFormatted, screenReaderText );
		} );
	}
} );

/**
 * Handles DOM changes to watch for new buttons.
 *
 * @param {Array} mutationRecords Array of MutationRecord objects.
 */
const handleDomChanges = ( mutationRecords ) => {
	mutationRecords.forEach( ( mutation ) => {
		const closestButton = mutation.target.closest( '[data-rest-like-button]' );

		if ( 'attributes' === mutation.type && closestButton ) {
			checkButton( closestButton );
		} else if ( 'childList' === mutation.type && mutation.addedNodes.length ) {
			mutation.addedNodes.forEach( ( node ) => {
				if ( typeof node.querySelectorAll !== 'function' ) {
					return;
				}

				const buttons = node.querySelectorAll( '[data-rest-like-button]' );
				if ( ! buttons.length ) {
					return;
				}

				buttons.forEach( ( button ) => checkButton( button ) );
			} );
		}
	} );
};

document.dispatchEvent(
	new CustomEvent( 'restLikes.initialized', {
		detail: {
			api,
		},
	} )
);

// Initialize.
checkButtons();

if ( typeof window.MutationObserver !== 'undefined' ) {
	const observer = new window.MutationObserver( handleDomChanges );
	observer.observe( document.body, {
		childList: true,
		subtree: true,
		attributes: true,
	} );
}

document.body.addEventListener( 'click', ( e ) => {
	const likeButton = e.target.closest( '[data-rest-like-button]' );

	if ( likeButton ) {
		api.buttonClickHandler(
			likeButton.getAttribute( 'data-type' ),
			likeButton.getAttribute( 'data-id' ),
			likeButton
		);
	}
} );
