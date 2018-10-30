/**
 * External dependencies.
 */
import { speak } from '@wordpress/a11y';
import { __, sprintf, setLocaleData } from '@wordpress/i18n';

(( document, window, restLikes ) => {
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
    }

    /**
     * Initially checks the status of every available like button on the page.
     */
    const checkButtons = () => {
        // Check localStorage for liked items, set class on the buttons.
        const likeButtons = document.querySelectorAll( '[data-rest-like-button]' );

        Array.prototype.forEach.call( likeButtons, likeButton => {
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
        } );
    };

    /**
     * Button click handler.
     *
     * @param {string} objectType
     * @param {number} objectId
     */
    const buttonClickHandler = ( objectType, objectId ) => {
        // Get all buttons for that specific object.
        const likeButtons = document.querySelectorAll( `[data-rest-like-button][data-type="${objectType}"][data-id="${objectId}"]` );

        const objectTypeData = restLikes.object_types[ objectType ];
        const classNames     = objectTypeData.classnames;

        Array.prototype.forEach.call( likeButtons, likeButton => {
            // Set class while processing.
            likeButton.classList.add( classNames.processing );
        } );

        fetch(
            restLikes.root + objectTypeData.endpoint.replace( '%s', objectId ),
            {
                method:  isLikedItem( objectType, objectId ) ? 'DELETE' : 'POST',
				headers: restLikes.nonce && {
					'X-WP-Nonce': restLikes.nonce,
				},
            }
        )
            .then( response => {
                if ( !response.ok ) {
                    throw Error( response.statusText );
                }

                return response.json();
            } )
            .then( response => {
                Array.prototype.forEach.call( likeButtons, likeButton => {
                    likeButton.classList.remove( classNames.processing );

                    const likeButtonCount = likeButton.querySelector( `.${classNames.count}` );

                    likeButtonCount.innerText = response.countFormatted;
                    likeButtonCount.setAttribute( 'data-likes', response.count );
                } );


				const likedItem = isLikedItem( objectType, objectId );

				if ( likedItem ) {
                    removeLikedItem( objectType, objectId );

                    Array.prototype.forEach.call( likeButtons, likeButton => {
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

                if ( !likedItem ) {
                    addLikedItem( objectType, objectId );

                    Array.prototype.forEach.call( likeButtons, likeButton => {
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

    /**
     * Sends a list of items for Heartbeat calls.
     */
    document.addEventListener( 'heartbeat-send', ( event, data ) => {
        data.rest_likes = {};

        Object.keys( restLikes.object_types ).forEach( objectType => {
            const likeButtons = document.querySelectorAll( `[data-rest-like-button][data-type="${objectType}"]` );
            const objectIds   = [];

            Array.prototype.forEach.call( likeButtons, likeButton => {
                objectIds.push( likeButton.getAttribute( 'data-id' ) )
            } );

            // Makes the list of object IDs unique.
            data.rest_likes[ objectType ] = [ ...new Set( objectIds ) ];
        } );
    } );

    /**
     * Listens to Heartbeat ticks and updates like counts for all received items.
     */
    document.addEventListener( 'heartbeat-tick', ( event, data ) => {
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

    // Initialize.
    checkButtons();

    // Allow triggering a custom event to check buttons again.
    document.body.addEventListener( 'restLikes', () => {
        checkButtons();
    } );

    const likeButtons = document.querySelectorAll( `[data-rest-like-button]` );

    // Set up event handlers.
    Array.prototype.forEach.call( likeButtons, likeButton => {
        likeButton.addEventListener( 'click', ( event ) => {
            buttonClickHandler( event.currentTarget.getAttribute( 'data-type' ), event.currentTarget.getAttribute( 'data-id' ) );
        } )
    } );
})( document, window, restLikes );
