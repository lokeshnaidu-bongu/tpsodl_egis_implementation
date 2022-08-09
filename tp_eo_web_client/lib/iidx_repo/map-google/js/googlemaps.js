/**
 * Retrieve handle on google maps object and treat as an AMD module
 * @module MapGoogle
 * @requires Google
 */
define(['map-google-component/googlemaps-loader!'],
  function GoogleMaps() {
    'use strict';
    /**
     * @memberof module:MapGoogle
     * @name google
     */
    return window.google;
  });
