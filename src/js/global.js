let oauthToken;

const fetchData          = async function( url, init = {} ) {
          if ( ! init.headers ) {
              init.headers = {};
          }

          init.headers['Client-ID'] = CLIENT_ID;

          const response = await fetch( url, init );

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
                      function( error ) { console.log( 'Error getting redirect URI: ' + error ) } // Error
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
      CLIENT_ID    = 'i9xbuttj2ai2ynysxki3fv05yuqntn',
      REDIRECT_URI = getRedirectURI(),
      RESOURCE_URL = resourceURL(),
      OAUTH_STATE  = generateOauthState(),
      API_URL_BASE = 'https://api.twitch.tv/helix/users';

      getSavedToken().then( function( token ) { oauthToken = token; } );
