( function( $ ) {
	var button = $( '.' + restPostLikes.button_classname );
	var counter = $( '.' + restPostLikes.count_classname );
	var storageKey = restPostLikes.storage_key;
	var storage, fail, uid;
	try {
		uid = new Date;
		(storage = window.localStorage).setItem(uid, uid);
		fail = storage.getItem(uid) != uid;
		storage.removeItem(uid);
		fail && (storage = false);
	} catch (exception) {}

	var getLikedPosts = function () {
		if ( storage ) {
			var storageData = storage.getItem( storageKey );
			if ( storageData ) {
				return JSON.parse( storageData );
			}
		}
		return [];
	};

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

	var removeLikedPost = function ( post_id ) {
		if ( storage ) {
			var storageData = getLikedPosts();
			storageData = _.reject( storageData, function( num ) { return num === post_id } );
			storageData = _.uniq( storageData );
			storage.setItem( storageKey, JSON.stringify( storageData ) );
		}
	};

	var buttonHandler = function () {

		var post_id = button.data( 'post-id' );

		if ( _.contains( getLikedPosts(), post_id ) ) {
			button.toggleClass( restPostLikes.liked_classname );
		}

		button.on( 'click', function () {

			var method = 'POST';

			if ( button.hasClass( restPostLikes.liked_classname ) ) {
				method = 'DELETE';
			}
			$.ajax( {
				url: wpApiSettings.root + 'rest-post-likes/v1/posts/' + post_id + '/like',
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
				button.toggleClass( restPostLikes.liked_classname );
				counter.text( response.count );
			} );
		});
	};

	$( document ).ready( function () {
		buttonHandler();
	});



})( jQuery );