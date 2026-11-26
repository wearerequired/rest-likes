/**
 * External dependencies.
 */
import { speak } from '@wordpress/a11y';
import { __, sprintf } from '@wordpress/i18n';

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
	if ( ! likeButtonCount ) {
		return;
	}

	const likeButtonSpanVisual = likeButtonCount.querySelector( '[aria-hidden]' );
	const likeButtonSpanScreenReader = likeButtonCount.querySelector( '.screen-reader-text' );

	if (
		! likeButtonSpanVisual ||
		! likeButtonSpanScreenReader ||
		String( count ) === likeButtonCount.getAttribute( 'data-likes' )
	) {
		return;
	}

	likeButtonSpanVisual.textContent = countFormatted;
	likeButtonSpanScreenReader.textContent =
		1 === count ? screenReaderText : sprintf( screenReaderText, countFormatted );

	likeButtonCount.setAttribute( 'data-likes', count );
};

/**
 * Returns all like buttons of an object.
 *
 * @param {string} objectType
 * @param {number} objectId
 * @return {NodeList} Like buttons.
 */
const getLikeButtons = ( objectType, objectId ) =>
	document.querySelectorAll(
		`[data-rest-like-button][data-type="${ objectType }"][data-id="${ objectId }"]`
	);

/**
 * Updates the count of all given like buttons of an object type.
 *
 * @param {NodeList} likeButtons
 * @param {string}   objectType
 * @param {Object}   data        Like count data as returned by the REST API.
 */
const updateLikeButtonsCount = ( likeButtons, objectType, data ) => {
	const classNames = window.restLikes.object_types[ objectType ].classnames;

	likeButtons.forEach( ( likeButton ) => {
		updateLikeButtonCount(
			likeButton.querySelector( `.${ classNames.count }` ),
			data.count,
			data.countFormatted,
			data.screenReaderText
		);
	} );
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
	const likeButtons = getLikeButtons( objectType, objectId );

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
			} );

			updateLikeButtonsCount( likeButtons, objectType, response );

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

/**
 * Builds the counts endpoint URLs for all like buttons on the page.
 *
 * Each URL contains the IDs of one object type, up to the endpoint's limit.
 * IDs are sorted so that every visitor of the same page requests the same URL,
 * which allows the response to be served from the page cache.
 *
 * @return {URL[]} Counts endpoint URLs.
 */
const getCountsUrls = () => {
	const urls = [];
	const limit = window.restLikes.counts_limit;

	Object.keys( window.restLikes.object_types ).forEach( ( objectType ) => {
		const likeButtons = document.querySelectorAll(
			`[data-rest-like-button][data-type="${ objectType }"]`
		);
		const objectIds = [ ...likeButtons ]
			.map( ( likeButton ) => parseInt( likeButton.getAttribute( 'data-id' ), 10 ) )
			.filter( ( objectId ) => objectId > 0 );
		const uniqueObjectIds = [ ...new Set( objectIds ) ].sort( ( a, b ) => a - b );

		for ( let i = 0; i < uniqueObjectIds.length; i += limit ) {
			const url = new URL(
				window.restLikes.root + window.restLikes.counts_endpoint,
				window.location.href
			);
			url.searchParams.set( objectType, uniqueObjectIds.slice( i, i + limit ).join( ',' ) );
			urls.push( url );
		}
	} );

	return urls;
};

/**
 * How long a count changed by the visitor is protected from older responses.
 *
 * Covers a stale page cache entry that is served once more while the cache
 * refreshes it in the background.
 */
const CHANGED_COUNT_TTL = 10 * 60 * 1000;

/**
 * Counts changed by the visitor during this page view.
 *
 * @type {Map<string, {count: number, expiresAt: number}>}
 */
const changedCounts = new Map();

document.addEventListener( 'restLikes', ( { detail } ) => {
	if ( 'like' === detail.action || 'unlike' === detail.action ) {
		changedCounts.set( `${ detail.objectType }:${ detail.objectId }`, {
			count: detail.count,
			expiresAt: Date.now() + CHANGED_COUNT_TTL,
		} );
	}
} );

/**
 * Determines whether a refreshed count would revert a change made by the visitor.
 *
 * @param {Object} item Like count data as returned by the REST API.
 * @return {boolean} Whether the count should be ignored.
 */
const isOutdatedCount = ( item ) => {
	const key = `${ item.objectType }:${ item.objectId }`;
	const changed = changedCounts.get( key );

	if ( ! changed ) {
		return false;
	}

	if ( item.count !== changed.count && Date.now() < changed.expiresAt ) {
		return true;
	}

	changedCounts.delete( key );
	return false;
};

/**
 * Updates the like counts of all buttons from the counts endpoint.
 *
 * @return {Promise} Resolves once the counts are updated, never rejects.
 */
api.refreshCounts = () =>
	Promise.resolve()
		.then( () =>
			Promise.all(
				getCountsUrls().map( ( url ) =>
					window.fetch( url ).then( ( response ) => {
						if ( ! response.ok ) {
							throw Error( response.statusText );
						}

						return response.json();
					} )
				)
			)
		)
		.then( ( responses ) => {
			for ( const item of responses.flat() ) {
				if ( ! isOutdatedCount( item ) ) {
					updateLikeButtonsCount(
						getLikeButtons( item.objectType, item.objectId ),
						item.objectType,
						item
					);
				}
			}
		} )
		.catch( ( error ) => {
			console.error( error ); // eslint-disable-line no-console
		} );

const refreshInterval = window.restLikes.refresh_interval * 1000;
let lastRefresh = Date.now();
let refreshTimer;

/**
 * Schedules the next like count refresh.
 *
 * Hidden tabs don't poll at all. A tab that becomes visible again
 * refreshes right away if its counts are older than the interval.
 */
const scheduleRefresh = () => {
	window.clearTimeout( refreshTimer );

	if ( ! refreshInterval || document.hidden ) {
		return;
	}

	refreshTimer = window.setTimeout(
		() => {
			lastRefresh = Date.now();
			api.refreshCounts().then( scheduleRefresh );
		},
		Math.max( 0, lastRefresh + refreshInterval - Date.now() )
	);
};

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
scheduleRefresh();
document.addEventListener( 'visibilitychange', scheduleRefresh );

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
