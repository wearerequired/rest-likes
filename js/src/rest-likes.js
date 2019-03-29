/**
 * External dependencies.
 */
import jQuery from 'jquery';
import { speak } from '@wordpress/a11y';
import { __, sprintf, setLocaleData } from '@wordpress/i18n';

/**
 * Load localized strings.
 */
setLocaleData( restLikes.l10n, 'rest-likes' );

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
	const CustomEvent = function ( event, params = { bubbles: false, cancelable: false, detail: undefined } ) {
		const evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	};

	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent    = CustomEvent;
}

/**
 *  Check for NodeList.prototype.forEach() support in the browser.
 *
 * @url https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
 */
if ( window.NodeList && ! NodeList.prototype.forEach ) {
	NodeList.prototype.forEach = Array.prototype.forEach;
}

const api = window.RestLikesApi = {}

/**
 * Get liked posts from localStorage.
 *
 * @returns {Array}
 */
const getLikedItems = objectType => {
	if ( storage ) {
		const storageData = storage.getItem( `rest-likes-${objectType}` );
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
			storage.setItem( `rest-likes-${objectType}`, JSON.stringify( storageData ) );
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
		storageData     = storageData.filter( num => num !== parseInt( objectId, 10 ) );
		storageData     = [ ...new Set( storageData ) ];
		storage.setItem( `rest-likes-${objectType}`, JSON.stringify( storageData ) );
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
	const objectId       = likeButton.getAttribute( 'data-id' );
	const objectType     = likeButton.getAttribute( 'data-type' );
	const objectTypeData = restLikes.object_types[ objectType ];
	const classNames     = objectTypeData.classnames;

	if ( likeButton.classList.contains( classNames.liked ) ) {
		return;
	}

	if ( isLikedItem( objectType, objectId ) ) {
		likeButton.classList.add( classNames.liked );
		likeButton.querySelector( `.${classNames.label}` ).innerHTML = objectTypeData.texts.unlike;
	}
}

/**
 * Initially checks the status of every available like button on the page.
 */
const checkButtons = () => {
	// Check localStorage for liked items, set class on the buttons.
	const likeButtons = document.querySelectorAll( '[data-rest-like-button]' );

	likeButtons.forEach( ( likeButton ) => checkButton( likeButton ) );
};

/**
 * Sends request to API.
 *
 * @param {string} objectType
 * @param {number} objectId
 * @param {bool} isLike
 */
api.request = ( objectType, objectId, isLike ) => {
	const objectTypeData = restLikes.object_types[ objectType ];

	return fetch(
		restLikes.root + objectTypeData.endpoint.replace( '%s', objectId ),
		{
			method:  isLike ? 'DELETE' : 'POST',
			headers: restLikes.nonce && {
				'X-WP-Nonce': restLikes.nonce,
			},
		}
	)
}

/**
 * Button click handler.
 *
 * @param {string} objectType
 * @param {number} objectId
 */
api.buttonClickHandler = ( objectType, objectId ) => {
	// Get all buttons for that specific object.
	const likeButtons = document.querySelectorAll( `[data-rest-like-button][data-type="${objectType}"][data-id="${objectId}"]` );

	const objectTypeData = restLikes.object_types[ objectType ];
	const classNames     = objectTypeData.classnames;

	likeButtons.forEach( ( likeButton ) => {
		// Set class while processing.
		likeButton.classList.add( classNames.processing );
	} );

	const likedItem = isLikedItem( objectType, objectId );

	api.request( objectType, objectId, likedItem )
		.then( response => {
			if ( !response.ok ) {
				throw Error( response.statusText );
			}

			return response.json();
		} )
		.then( response => {
			likeButtons.forEach( ( likeButton ) => {
				likeButton.classList.remove( classNames.processing );

				const likeButtonCount = likeButton.querySelector( `.${classNames.count}` );

				likeButtonCount.innerText = response.countFormatted;
				likeButtonCount.setAttribute( 'data-likes', response.count );
			} );

			if ( likedItem ) {
				removeLikedItem( objectType, objectId );

				likeButtons.forEach( ( likeButton ) => {
					likeButton.classList.remove( classNames.liked );
					likeButton.querySelector( `.${classNames.label}` ).innerHTML = objectTypeData.texts.like;
				} );

				/* translators: %d: Like count */
				speak( sprintf( __( 'Unlike processed. New like count: %d', 'rest-likes' ), response.count ) );

				document.dispatchEvent( new CustomEvent( 'restLikes', {
					detail: {
						'action':         'unlike',
						'count':          response.count,
						'countFormatted': response.countFormatted,
						objectType,
						objectId,
					}
				} ) );

				return;
			}

			if ( ! likedItem ) {
				addLikedItem( objectType, objectId );

				likeButtons.forEach( ( likeButton ) => {
					likeButton.classList.add( classNames.liked );
					likeButton.querySelector( `.${classNames.label}` ).innerHTML = objectTypeData.texts.unlike;
				} );

				/* translators: %d: Like count */
				speak( sprintf( __( 'Like processed. New like count: %d', 'rest-likes' ), response.count ) );

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
		} )
		.catch( error => {
			Array.prototype.forEach.call( likeButtons, likeButton => {
				likeButton.classList.remove( classNames.processing );
			} );

			console.log( error );
			speak( __( 'There was an error processing your request.', 'rest-likes' ) );

			document.dispatchEvent( new CustomEvent( 'restLikes', {
				detail: {
					'action': 'error',
					objectType,
					objectId,
				}
			} ) );
		} );
};

// We need jQuery do listen to custom events triggered by jQuery, see https://bugs.jquery.com/ticket/11047.
const $document = jQuery( document );

/**
 * Sends a list of items for Heartbeat calls.
 */
$document.on( 'heartbeat-send', ( event, data ) => {
	data.rest_likes = {};

	Object.keys( restLikes.object_types ).forEach( objectType => {
		const likeButtons = document.querySelectorAll( `[data-rest-like-button][data-type="${objectType}"]` );
		const objectIds   = [];

		likeButtons.forEach( ( likeButton ) => {
			objectIds.push( likeButton.getAttribute( 'data-id' ) )
		} );

		// Makes the list of object IDs unique.
		data.rest_likes[ objectType ] = [ ...new Set( objectIds ) ];
	} );
} );


/**
 * Listens to Heartbeat ticks and updates like counts for all received items.
 */
$document.on( 'heartbeat-tick', ( event, data ) => {
	if ( !data.rest_likes ) {
		return;
	}

	for ( const item of data.rest_likes ) {
		const { objectType, objectId, count, countFormatted } = item;
		const objectTypeData                                  = restLikes.object_types[ objectType ];
		const classNames                                      = objectTypeData.classnames;

		const likeButtons = document.querySelectorAll( `[data-rest-like-button][data-type="${objectType}"][data-id="${objectId}"]` );

		Array.prototype.forEach.call( likeButtons, likeButton => {
			const likeButtonCount = likeButton.querySelector( `.${classNames.count}` );

			likeButtonCount.innerText = countFormatted;
			likeButtonCount.setAttribute( 'data-likes', count );
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
		if ( ! mutation.addedNodes.length ) {
			return;
		}

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
	} );
}

document.dispatchEvent( new CustomEvent( 'restLikes.initialized', {
	detail: {
		api
	}
} ) );

// Initialize.
checkButtons();

if ( typeof window.MutationObserver  !== 'undefined' ) {
	const observer = new window.MutationObserver( handleDomChanges );
	observer.observe( document.body, {
		childList: true,
		subtree: true,
	} );
}

document.body.addEventListener( 'click', e => {
	const likeButton = e.target.closest( '[data-rest-like-button]' );

	if ( likeButton ) {
		api.buttonClickHandler( likeButton.getAttribute( 'data-type' ), likeButton.getAttribute( 'data-id' ), likeButton );
	}
} );
