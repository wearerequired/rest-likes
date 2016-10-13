( function( $ ) {
	var button = $( 'button.rest-post-like-button' );

	button.on('click', function() {
		console.log(button);

		var post_id = button.data('post-id');
		var method = 'POST';
		var nonce = button.data('nonce');

		if ( button.hasClass('liked') ) {
			method = 'DELETE';
			button.text( 'Unlike me' );
		}

		$.ajax( {
			url: wpApiSettings.root + 'rest-post-likes/v1/posts/' + post_id + '/like',
			method: method,
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
			}
		} ).done( function ( response ) {
			console.log( response );
			button.toggleClass( 'liked' );
		} );

	})

})( jQuery );