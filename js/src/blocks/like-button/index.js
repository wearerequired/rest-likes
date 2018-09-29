/**
 * WordPress dependencies.
 */
import {
    Component,
    Fragment,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/editor';
import {
    registerBlockType,
} from '@wordpress/blocks';
import {
    PanelBody,
    ToggleControl,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import LikeButton from '../../components/like-button';

registerBlockType( 'required/rest-likes', {
    title:  __( 'Like Button', 'rest-likes' ),

    description: __( 'Allow visitors to like this post', 'rest-likes' ),

    category: 'widgets',

    icon: 'heart',

    keywords: [
        __( 'like', 'rest-likes' ),
        __( 'favorite', 'rest-likes' ),
    ],

    supports: {
        anchor: false,
        customClassName: false,
        html: false,
    },

    attributes: {
        displayLikeCount: {
            type: 'boolean',
            default: true,
        },
    },

    edit( { className, attributes: { displayLikeCount }, setAttributes } ) {
        return (
            <Fragment>
                <LikeButton
                    displayCount={displayLikeCount}
                />
                <InspectorControls>
                    <PanelBody>
                        <ToggleControl
                            label={__( 'Display like count', 'rest-likes' )}
                            checked={displayLikeCount}
                            onChange={( newValue ) => {
                                setAttributes( { displayLikeCount: newValue } );
                            }}
                        />
                    </PanelBody>
                </InspectorControls>
            </Fragment>
        )
    },

    save() {
        // Rendering in PHP.
        return null;
    },
} );
