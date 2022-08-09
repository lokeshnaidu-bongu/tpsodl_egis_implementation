'use strict';
define([
    'jquery',
    'underscore',
    'OpenLayers3',
    'proj4',
    'map-helper',
    'map-loader',
    'comms',
    'map-layer-auth'
  ],
  function MapDSLayerCreator($, _, OpenLayers, proj4, MapHelper, Config, CommsLayer, MapLayerAuth) {

    var mapProj = MapHelper.getMapProjection();

    var generateTileGridProperties = function generateTileGridProperties(zoomLevels, tileSize, extent, isWMTS) {
      var size = OpenLayers.extent.getWidth(extent) / tileSize,
        resolutions = new Array(zoomLevels),
        matrixIds = new Array(zoomLevels);
      for (var i = 0; i < zoomLevels; ++i) {
        // create map zoom-levels for WMTS
        if (isWMTS) {
          matrixIds[i] = i;
        }
        // Generate and array of resolutions  for this WMTS
        resolutions[i] = size / Math.pow(2, i);
      }

      if (isWMTS) {
        return {
          matrixIds: matrixIds,
          resolutions: resolutions,
          tileSize: [tileSize, tileSize],
          extent: extent,
          origin: OpenLayers.extent.getTopLeft(extent)
        };
      } else {
        return {
          resolutions: resolutions,
          tileSize: [tileSize, tileSize],
          extent: extent,
          origin: OpenLayers.extent.getTopLeft(extent)
        };
      }
    };




    var layerCollection = function layerCollection(mapdsConfig) {
      var layers = [];

      var findLayerOrCreatePlaceholder = function findLayerOrCreatePlaceholder(layerName) {
        var layerToReturn;
        $.each(layers, function () {
          if (this.name === layerName) {
            layerToReturn = this;
            return false;
          }
        });
        if (typeof layerToReturn === 'undefined') {
          return false;
        }
        return layerToReturn;
      };


      var sortBaseLayersFrom = function sortBaseLayersFrom(layerList) {
        var baseLayers = [],
          overlayLayers = [];

        _.each(layerList, function (layer) {
          if (MapHelper.isBaseLayer(layer)) {
            baseLayers.push(layer);
          } else {
            overlayLayers.push(layer);
          }
        });

        //If there is only one base layer, it is set visible
        if (baseLayers.length === 1) {
          baseLayers[0].setVisible(true);
        }

        return baseLayers.concat(overlayLayers);
      };


      var sortLayers = function sortLayers() {
        var layerOrder = mapdsConfig.LayerOrder,
          sortedLayers = [];

        if (layerOrder === undefined) {
          sortedLayers = layers;
        } else {
          $.each(layerOrder, function () {
            //expand objects...
            if (typeof this === 'string') {
              var toPush = findLayerOrCreatePlaceholder(this);
              if (toPush) sortedLayers.push(findLayerOrCreatePlaceholder(this));
            } else {
              $.each(this.Layers, function () {
                var toPush = findLayerOrCreatePlaceholder(this);
                if (toPush) sortedLayers.push(findLayerOrCreatePlaceholder(this));
              });
            }
          });

          sortedLayers = sortedLayers.reverse();

          $.each(layers, function () {
            var layerItem = this;
            var layerFound = false;
            $.each(sortedLayers, function () {
              if (layerItem === this) {
                //it's included, break here.
                layerFound = true;
                return false;
              }
            });
            if (!layerFound) {
              sortedLayers.push(layerItem);
            }
          });
        }

        return sortedLayers;
      };

      var mapTileRenderType = function mapTileRenderType() {
        var mapTileRender = null;
        if (!navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
          mapTileRender = 'resize';
        }
        return mapTileRender;
      };

      if (mapdsConfig.Layers) {
        var layerConfig = mapdsConfig.Layers;

        proj4.defs(mapProj.name, mapProj.definition);

        /* Takes the layer config and in turn creates and adds OpenLayer Layer
           instances for each of WMTS, WMS, Google, OSM and Bing layer types.
           Returns this collection of layers.*/

        if (layerConfig.WMTS) {
          var authorizedLayers = MapLayerAuth.getAuthorizedLayers(layerConfig.WMTS);
          _.each(authorizedLayers, function (authorizedLayer) {
            createTileLayer(authorizedLayer.layer, authorizedLayer.InternalLayerName, layers, authorizedLayer.ExternalLayerName);
          });
        }

        if (layerConfig.WMS) {
          $.each(layerConfig.WMS, function (index, val) {

            var extent = val.Extent || mapProj.maxExtent;
            //iterate through array or object
            var tileLayer = new OpenLayers.layer.Tile({
              opacity: val.Opacity,
              visible:  val.Visible !== false || val.IsBaseLayer === true,
              extent: extent,
              source: new OpenLayers.source.TileWMS({
                layer: val.InternalLayerName,
                params: val.WMSParameters,
                attributions: [],
                url: val.URL,
                projection: mapProj.name,
              })
            });
              
            addLayerConfigurationFields(tileLayer, val, false, val.ExternalLayerName);
            layers.push(tileLayer);
          });
        }

        if (layerConfig.Image) {
          $.each(layerConfig.Image, function (index, val) {
            var imageLayer = new OpenLayers.layer.Image({
              opacity: val.Opacity,
              visible: val.Visible || ((val.IsBaseLayer) ? false : true),
              source: new OpenLayers.source.ImageStatic({
                attributions: [],
                layer: val.InternalLayerName,
                url: val.FileName,
                projection: mapProj.name,
                imageExtent: val.Extent
              })
            });
            addLayerConfigurationFields(imageLayer, val, false, val.ExternalLayerName);
            layers.push(imageLayer);

          });
        }

        if (layerConfig.OSM) {
          $.each(layerConfig.OSM, function (index, val) {
            //iterate through array or object
            var tileLayer = new OpenLayers.layer.Tile({
              source: new OpenLayers.source.OSM(),
              opacity: val.Opacity || 0.7,
              visible: val.Visible || true,
            });
            addLayerConfigurationFields(tileLayer, val, true, val.ExternalLayerName);
            layers.push(tileLayer);
          });
        }
        if (layerConfig.Bing) {
          $.each(layerConfig.Bing, function (index, val) {

            //iterate through array or object
            var tileLayer = new OpenLayers.layer.Tile({
              opacity: val.Opacity || 0.7,
              visible: val.Visible || ((index === 0) ? true : false),
              source: new OpenLayers.source.BingMaps({
                isBaseLayer: true,
                key: val.Key || mapdsConfig.Bing.Key,
                imagerySet: val.Type,
                layer: val.InternalLayerName,
                transitionEffect: mapTileRenderType,
                wrapDateLine: true
              })
            });
            addLayerConfigurationFields(tileLayer, val, true, val.ExternalLayerName);
            layers.push(tileLayer);

          });
        }

        if (layerConfig.BlankBase) {
          $.each(layerConfig.BlankBase, function (index, val) {
            var blankLayer = new OpenLayers.layer.Vector('none');
            addLayerConfigurationFields(blankLayer, val, true, val.ExternalLayerName);
            layers.push(blankLayer);
          });
        }

        return sortBaseLayersFrom(sortLayers());
      }
    };

    var createTileLayer = function (val, name, layers, externalName) {
      var extent = val.Extent || mapProj.maxExtent;
      var tileGrid = new OpenLayers.tilegrid.WMTS(generateTileGridProperties(val.ZoomLevels, val.TileSize, extent, true));
      var tileLayer = new OpenLayers.layer.Tile({ //iterate through array or object
            style: '',
            opacity: val.Opacity,
            visible: val.Visible !== false || val.IsBaseLayer === true,
            // extent: extent, passing this causes zoom levels greater than 23 to not be shown.
            maxResolution: val.maxResolution || mapProj.maxResolution,
            source: new OpenLayers.source.WMTS({
              layer: name,
              attributions: [],
              url: val.URL,
              matrixSet: val.MatrixSet,
              format: 'image/png',
              projection: mapProj.name,
              tileGrid: tileGrid,
              tileLoadFunction: CommsLayer.customLoader
            })
          });
 
      tileLayer.set('ServerLayerName', name);
      addLayerConfigurationFields(tileLayer, val, false, externalName);
      layers.push(tileLayer);
    };

    var addLayerConfigurationFields = function addLayerConfigurationFields(layer, val, isBaseLayerByDefault, name) {
      if (layer.getSource()) {
        layer.getSource().isBaseLayer = val.IsBaseLayer || isBaseLayerByDefault;
        layer.getSource().name = name;
        layer.getSource().type = val.Type || 'default';
      } else { //In the case of blank tile
        layer.isBaseLayer = val.IsBaseLayer || isBaseLayerByDefault;
        layer.name = val.ExternalLayerName;
        layer.type = val.Type || 'default';
      }
      if (val.InternalLayerName) {
        layer.set('InternalLayerName', val.InternalLayerName);
      }
    };

    return ({
      layerCollection: layerCollection
    });
  });
