const optionsForm = document.getElementById( 'options' ),
      oauthAction = function( e ) {
          if ( oauthToken ) {
              browser.storage.local.remove( 'access_token' )
                  .then( function() { oauthToken = null; userCheck(); } );
          } else {
              browser.runtime.sendMessage( { action: 'oauth' } ).then( userCheck );
          }

          e.preventDefault();
      },
      userCheck   = function() {
          let oauthData,
              oauthContent  = document.getElementById( 'oauth-token' ),
              optionsFooter = document.getElementById( 'options-footer' ),
              savedOauth    = browser.storage.local.get( 'access_token' );

          savedOauth.then( function( setting ) {
              return setting.access_token;
          } ).then( function( token ) {
              if ( token ) {
                  fetchData( API_URL_BASE, {
                      headers: {
                          Authorization: 'Bearer ' + token
                      }
                  } )
                      .then( function( data ) {
                          let rawData          = data.data[0],
                              oauthData        = document.getElementById( 'data-contain' ) || document.createElement( 'div' );
                              profileImage     = document.createElement( 'img' ),
                              userContain      = document.createElement( 'p' );
                              displayName      = document.createElement( 'span' ),
                              disconnectButton = document.createElement( 'button' );

                          profileImage.src                = rawData.profile_image_url;
                          profileImage.width              = 70;
                          profileImage.height             = 70;
                          profileImage.className          = 'twitch-profile-image';

                          displayName.className   = 'twitch-display-name';
                          displayName.textContent = rawData.display_name;

                          userContain.id          = 'twitch-user-info';
                          userContain.className   = 'twitch-user-info';
                          userContain.textContent = 'Currently connected as: ';
                          userContain.appendChild( profileImage );
                          userContain.appendChild( displayName );

                          disconnectButton.type        = 'submit';
                          disconnectButton.className   = 'panel-section-footer-button';
                          disconnectButton.value       = 'disconnect-account';
                          disconnectButton.textContent = 'Disconnect Account';

                          oauthData.id        = 'data-contain';
                          oauthData.innerHTML = '';
                          oauthData.appendChild( userContain );

                          oauthContent.innerHTML = '';
                          oauthContent.appendChild( oauthData );

                          optionsFooter.appendChild( disconnectButton );

                          return;
                      } );

              } else {
                  oauthData           = document.createElement( 'button' );
                  oauthData.type      = 'submit';
                  oauthData.className = 'default';
                  oauthData.innerHTML = 'Connect Twitch Account'

                  oauthContent.innerHTML = '';
                  oauthContent.appendChild( oauthData );

                  optionsFooter.innerHTML = '';
              }
          } );
      };

window.addEventListener( 'load', userCheck );
optionsForm.addEventListener( 'submit', oauthAction );
browser.storage.onChanged.addListener( function( changes, _areaName ) {
    if ( changes.access_token.newValue ) {
        optionsForm.submit();
    }
} );
