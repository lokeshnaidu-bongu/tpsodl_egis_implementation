/**
 * Requests the config file defined to describe the layers to be created and other client configuration.
 * @module MapLoader
 * @requires MapConfig
 */
define(['map-config!'], function MapDSConfig(mapds) {
  'use strict';

  /**
   * Determines if a particular SideBarControl has been defined in the config file
   * @memberof module:MapLoader
   * @name isAvailable
   * @param {string} componentName - Name of component to look for.
   * @returns {boolean} If the component is Available
   */
  mapds.isAvailable = function isAvailable(componentName) {
    for (var index in mapds.SideBarControls) {
      if (mapds.SideBarControls[index].target === componentName) {
        return true;
      }
    }
    return false;
  };

  return mapds;
});
