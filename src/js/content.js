/***********************************************************************
 * TTV Viewer Card Follow Button - Replaces Twitch chat's viewr card
 * "Add Friend" button with a "Follow"/"Unfollow" button.
 * Copyright (C) 2020  Argo Wizbang
 *
 * This file is a part of TTV Viewer Card Follow button.
 *
 * TTV Viewer Card Follow button is free software: you can redistribute
 * it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * TTV Viewer Card Follow button is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with TTV Viewer Card Follow button.  If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * Support: https://github.com/argowizbang/ttv-viewer-card-follow-button/
 * Contact: argowizbang@gmail.com
 **********************************************************************/

'use strict';

let viewerId, viewerCard, newButtons, buttonSVGs, followTextContainer, followAction,
    currentUser        = {
        id: 0,
        login: ''
    };

const ROOT                      = document.getElementById( 'root' ),
      isFollowing               = async function( e ) {
          return await fetchData( FOLLOWS_ENDPOINT + '?from_id=' + currentUser.id + '&to_id=' + viewerId )
            .then( function ( data ) { return Boolean( data.total ); } );
      },
      forceGenerateUserDropdown = function() {
            /**
             * Twitch does not display the current user's username or user ID anywhere on the page on initial page load.
             * However, the username is displayed in the dropdown shown when clicking on the user's profile picture in the upper-right corner.
             * That said, this dropdown is not actually generated until some kind of mouse activity occurs on the profile picture.
             * This function temporarily hides that dropdown via CSS to prevent it from showing up while we generate clicks on the profile picture to show/hide the dropdown.
             */
            const SCRIPT_CSS = document.createElement( 'style' );

            SCRIPT_CSS.id        = 'vcfb-css';
            SCRIPT_CSS.innerHTML = '.tw-pd-y-1 [data-test-selector="balloon-inside-click-detector"] { display: none !important; }';
            document.head.appendChild( SCRIPT_CSS );

            ROOT.querySelector( '.tw-pd-y-1 [data-test-selector="user-menu__toggle"]' ).click(); // Click to open dropdown and grab Twitch username

            currentUser.login   = document.querySelector( '.user-menu-dropdown__main-menu [data-a-target="user-display-name"]' ).textContent.trim();

            SCRIPT_CSS.remove();

            ROOT.querySelector( '.tw-pd-y-1 [data-test-selector="user-menu__toggle"]' ).click(); // Click again to close dropdown

            if ( ! currentUser.id ) {
                fetchData( API_URL_BASE + '?login=' + currentUser.login )
                    .then( function( data ) { currentUser.id = data.data[0].id; } );
            }

            // If saved oAuth token doesn't match up with this user, remove the token
            browser.runtime.sendMessage( {
                action: 'validate_user',
                user:   currentUser.login.toLowerCase()
            } );
        },
        detectViewerCard          = function ( e ) {
            if ( e.target.classList.contains( 'chat-author__display-name' ) || e.target.classList.contains( 'chat-line__message-mention' ) || e.target.classList.contains( 'tw-capcase' ) || e.target.classList.contains( 'tw-ellipsis' ) || e.target.parentNode.classList.contains ( 'chatter-name' ) ) {
                let viewerName    = e.target.textContent.trim().toLowerCase();

                viewerCard  = document.getElementsByClassName( 'chat-room__viewer-card' )[0].getElementsByClassName( 'viewer-card-layer' )[0];

                fetchData( API_URL_BASE + '?login=' + viewerName )
                    .then( function( data ) { viewerId = data.data[0].id; } );

                viewerCardObserver.observe( viewerCard, {
                    childList: true,
                    subtree:   true
                } );

                if ( ! currentUser.id ) { // If we haven't yet gotten the current user's user ID, we do so now
                    fetchData( API_URL_BASE + '?login=' + currentUser.login )
                        .then( function( data ) { currentUser.id = data.data[0].id; } );
                }
            }
        },
        detectAddFriendButton           = function( mutationsList, _observer ) {
            let mutation, addFriendButton, viewerCardUser,
                currentChannelName = document.getElementsByClassName( 'channel-info-content' )[0].getElementsByTagName( 'h1' )[0].textContent.trim();

            for( mutation of mutationsList ) {
                addFriendButton = mutation.target.querySelector( '[data-test-selector="add-button"], [data-test-selector="cancel-button"], [data-test-selector="accept-button"],[data-test-selector="unfriend-button"]' );

                viewerCardUser  = mutation.target.getElementsByClassName( 'viewer-card-header__display-name' )[0].getElementsByClassName( 'tw-interactive' )[0].textContent.trim();
                if ( addFriendButton && viewerCardUser && currentChannelName !== viewerCardUser ) {
                    convertAddFriendToFollow( addFriendButton );
                    break;
                }
            }
        },
        showNotifButtons                = function() {
            isFollowing().then( function( following ) {
                if ( oauthToken && ! following ) {
                    newButtons.notifsContainer.classList.toggle( 'vcfb-animate' );
                } else if ( ! oauthToken ) {
                    browser.runtime.sendMessage( { action: 'options' } );
                } else {
                    followChannel();
                }
            } );
        },
        changeFollowText                = function( action ) {
            isFollowing().then( function( following ) {
                if ( action === 'init' ) {
                    following = ! following;
                }

                if ( ! following ) {
                    buttonSVGs.follow.normal.src   = resourceURL( 'img/following.svg' );
                    buttonSVGs.follow.hover.src    = resourceURL( 'img/unfollow.svg' );
                    followTextContainer.textContent = 'Unfollow';
                    newButtons.follow.setAttribute( 'data-test-selector', 'unfollow-button' );
                    newButtons.follow.setAttribute( 'aria-label', 'Unfollow Button' );
                    newButtons.follow.classList.remove( 'tw-core-button--primary' );
                    newButtons.follow.classList.add( 'tw-core-button--destructive' );
                } else {
                    buttonSVGs.follow.normal.src    = resourceURL( 'img/not-following.svg' );
                    buttonSVGs.follow.hover.src     = resourceURL( 'img/following.svg' );
                    followTextContainer.textContent = 'Follow';
                    newButtons.follow.setAttribute( 'data-test-selector', 'follow-button' );
                    newButtons.follow.setAttribute( 'aria-label', 'Follow Button' );
                    newButtons.follow.classList.add( 'tw-core-button--primary' );
                    newButtons.follow.classList.remove( 'tw-core-button--destructive' );
                }
            } );

            newButtons.notifsContainer.classList.remove( 'vcfb-animate' );
        },
        followChannel                   = function( notificationsSetting ) {
            changeFollowText();
            
            isFollowing().then( function( following ) {
                let followAction = following ? 'DELETE' : 'POST';

                fetchData( FOLLOWS_ENDPOINT, {
                    method: followAction,
                    body:   JSON.stringify( {
                        from_id:             currentUser.id,
                        to_id:               viewerId,
                        allow_notifications: notificationsSetting
                    } )
                } );
            } );
        },
        setupButton                     = function( buttonName, ariaLabel, callback ) {
            let buttonText = newButtons[ buttonName ].querySelector( '[data-a-target="tw-core-button-label-text"]' );

            if ( newButtons[ buttonName ].classList.contains( 'tw-button--success' ) ) { // User is already a friend
                newButtons[ buttonName ].getElementsByClassName( 'tw-button__alert-text' )[0].remove();
            }
            
            if ( newButtons[ buttonName ].dataset.testSelector === 'accept-button' && viewerCard.querySelector( '[data-test-selector="reject-button"]' ) ) {
                viewerCard.querySelector( '[data-test-selector="reject-button"]' ).remove();
            }
    
            buttonSVGs[ buttonName ].normal.className = 'tw-svg__asset--inherit vcfb-icon tw-mg-r-05';
            newButtons[ buttonName ].className = 'tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--primary tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative vcfb-button';
            newButtons[ buttonName ].setAttribute( 'data-test-selector', buttonName + '-button' );
            newButtons[ buttonName ].setAttribute( 'aria-label', ariaLabel );
            newButtons[ buttonName ].addEventListener( 'click', callback );
            buttonText.parentNode.insertBefore( buttonSVGs[ buttonName ].normal,  buttonText );

            if ( buttonSVGs[ buttonName ].hover ) {
                buttonSVGs[ buttonName ].hover.className = '.tw-svg__asset--inherit vcfb-icon vcfb-hover-icon tw-mg-r-05';
                buttonText.parentNode.insertBefore( buttonSVGs[ buttonName ].hover, buttonText );
            }

            if ( buttonName === 'notifsOn' || buttonName === 'notifsOff' ) {
                buttonSVGs[ buttonName ].normal.classList.remove( 'tw-mg-r-05' );
                newButtons[ buttonName ].classList.remove( 'tw-core-button--primary' );
                newButtons[ buttonName ].classList.add( 'tw-mg-r-05' );
                newButtons[ buttonName ].title = 'Turn notifications ' + buttonName.replace( 'notifsO', 'o' );

                buttonText.remove();
            } else if ( ! oauthToken ) {
                newButtons[ buttonName ].classList.add( 'vcfb-error' );
            }
        },
        convertAddFriendToFollow        = function( addFriendButton ) {
            newButtons          = {
                mainContainer:   document.createElement( 'div' ),
                follow:          addFriendButton.cloneNode( true ),
                notifsContainer: document.createElement( 'div' ),
                notifsOn:        addFriendButton.cloneNode( true ),
                notifsOff:       addFriendButton.cloneNode( true )
            };
            buttonSVGs          = {
                follow:    {
                    normal: document.createElement( 'img' ),
                    hover:  document.createElement( 'img' )
                },
                notifsOn:  {
                    normal: document.createElement( 'img' )
                },
                notifsOff: {
                    normal: document.createElement( 'img' )
                }
            };
            followTextContainer = newButtons.follow.querySelector( '[data-a-target="tw-core-button-label-text"]' );

            // "Follow" button
            buttonSVGs.follow.normal.src = resourceURL( 'img/not-following.svg' );
            buttonSVGs.follow.hover.src  = resourceURL( 'img/following.svg' );
            setupButton( 'follow', 'Follow Channel', showNotifButtons );

            // "Notifications On" button
            buttonSVGs.notifsOn.normal.src = resourceURL( 'img/notifications-on.svg' );
            setupButton( 'notifsOn', 'Notifications On', function() { followChannel( true ); } );

            // "Notification Off" button
            buttonSVGs.notifsOff.normal.src = resourceURL( 'img/notifications-off.svg' );
            setupButton( 'notifsOff', 'Notifications Off', function() { followChannel( false ); } )

            // Notification setting buttons container
            newButtons.notifsContainer.id = newButtons.notifsContainer.className = 'vcfb-notification-buttons-container';
            newButtons.notifsContainer.appendChild( newButtons.notifsOn );
            newButtons.notifsContainer.appendChild( newButtons.notifsOff );

            // Main Button container
            newButtons.mainContainer.id = newButtons.mainContainer.className = 'vcfb-main-button-container';
            newButtons.mainContainer.appendChild( newButtons.follow );
            newButtons.mainContainer.appendChild( newButtons.notifsContainer );

            changeFollowText( 'init' );

            addFriendButton.parentNode.replaceChild( newButtons.mainContainer, addFriendButton );
        },
        viewerCardObserver              = new MutationObserver( detectAddFriendButton );

forceGenerateUserDropdown();
ROOT.addEventListener( 'click', detectViewerCard );
ROOT.addEventListener( 'click', function( e ) { // Hide Notification buttons if clicked off
    if ( ! e.target.closest( '.vcfb-main-button-container' ) && document.getElementById( 'vcfb-notifications-container' ) ) {
        document.getElementById( 'vcfb-notifications-container' ).classList.remove( 'vcfb-animate' );
    }
} );
