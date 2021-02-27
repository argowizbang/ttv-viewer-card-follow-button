/***********************************************************************
 * * TTV Viewer Card Follow Button - Replaces Twitch chat's viewr card
 * "Add Friend" button with a "Follow"/"Unfollow" button.
 * Copyright (C) 2020  Argo Wizbang
 *
 * This file is a part of TTV Viewer Card Follow button.
 *
 * TTV Viewer Card Follow Button is free software: you can redistribute
 * it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * TTV Viewer Card Follow Button is distributed in the hope that it
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

let oauthToken;

const fetchData          = async function( url, init = {} ) {
          if ( ! init.headers ) {
              init.headers = {};
          }

          init.headers['Client-ID']    = CLIENT_ID;
          init.headers['Content-Type'] = 'application/json';

          const response = await getSavedToken().then( async function( token ) {
              if ( ! init.headers['Authorization'] ) {
                  init.headers['Authorization'] = 'Bearer ' + token;
              }
              const oauthResponse = await fetch( url, init );

              return oauthResponse;
          } );

          return await response.json();
      },
      getRedirectURI     = function() { // Get extension's redirect URI
          let redirectURI;

          if ( browser.identity ) {
              redirectURI = browser.identity.getRedirectURL();
          } else {
              browser.runtime.sendMessage( { action: 'redirect_url' } )
                  .then(
                      function( message ) { redirectURI = message.response; }, // Success
                      function( error ) { console.error( 'Error getting redirect URI: ' + error ) } // Error
                  );
          }

          return redirectURI;
      },
      generateOauthState = function() { // Randomly generate state for oAuth token generation
          const stateChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          
          let intArray = new Uint8Array( 40 );

          window.crypto.getRandomValues( intArray );

          intArray = intArray.map( x => stateChars.charCodeAt( x % stateChars.length ) );

          return String.fromCharCode.apply( null, intArray );
      },
      resourceURL        = function( path = '' ) {
          return browser.runtime.getURL( path );
      },
      getSavedToken      = async function() {
          const accessToken = await browser.storage.local.get( 'access_token' )
              .then( function( setting ) { return setting.access_token; } );
          
          return accessToken;
      },

      // Globals
      CLIENT_ID        = 'i9xbuttj2ai2ynysxki3fv05yuqntn',
      REDIRECT_URI     = getRedirectURI(),
      RESOURCE_URL     = resourceURL(),
      OAUTH_STATE      = generateOauthState(),
      API_URL_BASE     = 'https://api.twitch.tv/helix/users',
      FOLLOWS_ENDPOINT = API_URL_BASE + '/follows';

getSavedToken().then( function( token ) { oauthToken = token; } );
