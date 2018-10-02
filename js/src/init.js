(( document, window, restLikes ) => {
    const script = document.createElement( 'script' );

    script.src   = ('Promise' in window) && ('fetch' in window) ? restLikes.scripts.modernBrowsers : restLikes.scripts.legacyBrowsers;
    script.async = true;

    document.body.appendChild( script );
})( document, window, restLikes );
