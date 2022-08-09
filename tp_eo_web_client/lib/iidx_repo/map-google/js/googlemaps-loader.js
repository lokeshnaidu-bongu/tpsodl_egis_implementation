'use strict';
define(['jquery'],
  function GoogleMapsLoader($) {
    return {
      load: function (name, req, onLoad, config) {

        if (config.isBuild) {
          onLoad(null);
        } else {
          require(['map-loader'], function (mapConfig) {
            if (!mapConfig.Layers.Google) {
              window.google = false;
              onLoad();
              return;
            }

            var clientID = '&client=' + mapConfig.Google.googleClientID,
              channelID = '&channel=' + mapConfig.Google.googleChannelID,
              version = mapConfig.Google.version ? '&v=' + mapConfig.Google.version : '',
              otherParams = 'libraries=places' + clientID + channelID + version,
              url = 'https://maps.googleapis.com/maps/api/js?' + otherParams;
            

            $.getScript(url, function () {
              onLoad();
            });
          });
        }
      }
    };
  });