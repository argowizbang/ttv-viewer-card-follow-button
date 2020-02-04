const installationHook  = function() {
          browser.storage.local.get( 'access_token' )
              .then( function( setting ) {
                  if ( ! setting.access_token ) {
                      browser.runtime.openOptionsPage();
                  }
              } );
      },
      requestOauthToken = function() { // Get oAuth token from Twitch
          return browser.identity.launchWebAuthFlow( {
              interactive: true,
              url:         'https://id.twitch.tv/oauth2/authorize' +
                  '?client_id=' + CLIENT_ID +
                  '&redirect_uri=' + encodeURIComponent( REDIRECT_URI ) +
                  '&response_type=token' +
                  '&scope=user_read+user_follows_edit' +
                  '&force_verify=true' +
                  '&state=' + OAUTH_STATE
          } )
              .then( function( response ) {
                  let params = new URL( response.replace( '#', '?' ) ).searchParams;

                  if ( params.get( 'state' ) === OAUTH_STATE ) {
                      browser.storage.local.set( { access_token: params.get( 'access_token' ) } );
                  }
              } );
      },
      messageListener   = function( request, _sender, sendResponse ) {
          switch ( request.action ) {
              case 'oauth':
                  sendResponse( { response: requestOauthToken( true ) } );
                  break;

              case 'options':
                  browser.runtime.openOptionsPage();
                  break;

              case 'redirect_url':
                  sendResponse( { response: browser.identity.getRedirectURL() } );
                  break;

               case 'validate_user':
                    browser.storage.local.get( 'access_token' )
                        .then( function( setting ) {
                            if ( setting.access_token ) {
                                fetchData( API_URL_BASE, {
                                    headers: {
                                        Authorization: 'Bearer ' + setting.access_token
                                    }
                                } )
                                    .then( function( data ) {
                                        if ( data.data[0].login !== request.user ) {
                                            browser.storage.local.remove( 'access_token' );
                                        }
                                    } );
                            }
                        } );
                    break;
          }
      }

browser.runtime.onInstalled.addListener( installationHook );
browser.runtime.onMessage.addListener( messageListener );
