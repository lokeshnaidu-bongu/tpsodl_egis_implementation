require(['lib/require.config.js','src/require.config.js','TPSODL_Custom_Src/require.config.js'], function () {
    'use strict';
    require.config({
      config: {
        'map-loader': { configFileName: 'config/map-config.json'},
        'server-config': { configFileName: 'config/server-config.json'}
      }});
    require([
        'eo-web',
        'map-location',
        'map-visualization',
        'eo-generic-info',
        'eo-specialised-info',
        'eo-location-info',
        'eo-phase-info'
      ],
      function(ElectricNetworkViewer) {
        ElectricNetworkViewer.init();
      });
  });
  var tpsodl_urn,selectedIndividualFeatureOnMap,trailURN,req_urns="";
  var osm_tileLayer;
  var osmFlag = true;
  var XMLWriter = require(['components/xml-writer/lib/xml-writer.js']);
  var l_logindatetime = "";