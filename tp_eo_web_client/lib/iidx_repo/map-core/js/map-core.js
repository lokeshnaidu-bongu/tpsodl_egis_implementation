define(['jquery',
    'underscore',
    'map-loader',
    'map-helper',
    'map-google',
    'OpenLayers3',
    'proj4',
    'map-core-component/map-layer-creator',
    'map-core-component/pubsub',
    'ge-bootstrap',
    'modernizr'
  ],


  function MapDSMap($, _, mapdsConfig, MapHelper, google, OpenLayers, proj4, mapdsLayerCreator) {
    'use strict';

    var UP = 38,
      DOWN = 40,
      LEFT = 37,
      RIGHT = 39,
      PAGE_UP = 33,
      PAGE_DOWN = 34,
      END = 35,
      HOME = 36,
      PX_SMALL_PAN = 100,
      SMALL_MULTIPLIER = 2,
      LARGE_MULTIPLIER = 4,
      COMMAND = 91,
	  //googleTilesFlag = true,
      CONTROL = 17;


    var initialised = false,
      wgs84CoordinateSystem = new OpenLayers.proj.get('EPSG:4326'),
      mapProj = MapHelper.getMapProjection(),
      alertPopupTemplate = '<div class="alert alert-info popup-navigation hide" id="alertPopup" style="position:absolute;top:0px;"></div>',
      mapTemplate = '<div id="olmap" style="width:100%; height:100%; position: absolute; right:0; top:0"></div>',
      __olMap,
      gmap,
      trafficLayer,
      name,
      $mapSelector,
      $containerSelector,
      $popUpAlertSelector = null,
      isCommandDown = false,
      isControlDown = false,
      allowKeyPress = true,
      service;

    var onStreetViewExit = function (streetViewSelector, streetViewPosition, mapName) {
      // Subscription method called when exiting from StreetView.
      if (mapName === name) {
        setBusyCursor();
        var exitZoom = MapHelper.getNumberOfZoomLevels() - 1,
          position = streetViewPosition;
        //recenter the map
        MapHelper.setCurrentMapCentreAndZoom(__olMap, [position[0], position[1]], exitZoom);
        clearBusyCursor();
      }
    };

    var eventSubscribe = function eventSubscribe() {
      $.subscribe('gotoAddress', function (address, mapName) {
        if (mapName === name) {
          gotoAddress(address);
        }
      });

      $.subscribe('streetViewExit', onStreetViewExit);

      $.subscribe('zoomInMap', function (mapName) {
        if (mapName === name) {
          zoomManager.zoomingIn();
          zoomManager.zoom(MapHelper.getCurrentMapCentre(__olMap), undefined, false);
        }
      });

      $.subscribe('zoomOutMap', function (mapName) {
        if (mapName === name) {
          zoomManager.zoomingOut();
          zoomManager.zoom(MapHelper.getCurrentMapCentre(__olMap), undefined, false);
        }
      });

      $.subscribe('initNewGeoLocateControlForMap', function (geoLocateControl, mapName) {
        if (mapName === name) {
          __olMap.addControl(geoLocateControl);
        }
      });

      $.subscribe('mapPopupAlert', function (text, mapName) {
        if (mapName === name) {
          displayAlert(text);
        }
      });

      $.subscribe('overlayVisibilityChanged', sortOverlays);

      $.subscribe('mapInitialised', sortOverlays);

      $.subscribe('allowKeyPresses', function (allowKeyPressState) {
        allowKeyPress = allowKeyPressState;
      });

    };

    var eventPublish = function eventPublish() {
      $mapSelector.click(function () {
        $.publish('mapClicked', []);
        $.publish('beforePopupCreated');
        $.publish('mapHasFocus', [getContainerSelector()]);
      });
      $.publish('mapInitialised', [name, olMap(), gmap, trafficLayer]);
    };

    var zoomEndPublish = function zoomEndPublish() {
      $.publish('zoomEnd', [name, olMap()]);
    };

    var changeBaseLayerPublish = function changeBaseLayerPublish() {
      $.publish('changebaselayer', [name, olMap()]);
    };

    var init = function init(map) {

      var layerCollection = mapdsLayerCreator.layerCollection(mapdsConfig);
      $containerSelector = map;
      name = $containerSelector.data('map-name');

      //build map div
      $mapSelector = $(mapTemplate);

      $containerSelector[0].appendChild($mapSelector[0]);
      $containerSelector.css({
        'width': '100%',
        'height': '100%',
        'right': '0',
        'top': '0',
        'position': 'absolute'
      });

      //Load projection system
      if (mapProj.definition && !OpenLayers.proj.get(mapProj.name)) {
        proj4.defs(mapProj.name, mapProj.definition);
        OpenLayers.proj.addProjection(new OpenLayers.proj.Projection({
          code: mapProj.name,
          extent: [-20037508.3400, -20037508.3400, 20037508.3400, 20037508.3400]
        }));
      }

      var initZoomControls = function initZoomControls() {

        // handler for key up
        var onKeyDown = function (e) {
          if (!allowKeyPress)
            return true;
          var currentCenter = MapHelper.getCurrentMapCentre(__olMap);
          // flags are set for mousewheel zoom levels
          isCommandDown = e.metaKey;
          isControlDown = e.ctrlKey;

          // zoom
          if (e.keyCode === 189 || e.keyCode === 109) {
            // minus key
            zoomManager.zoomingOut();
            zoomManager.zoom(currentCenter, undefined, false);
            return false;
          }
          if (e.keyCode === 187 || e.keyCode === 107) {
            // plus key
            zoomManager.zoomingIn();
            zoomManager.zoom(currentCenter, undefined, false);
            return false;
          }

          // enable other keyboard controls here
          if (e.keyCode === UP) { // up arrow

            // TODO Invetigate the following animation.pan applying to google (currently only effects OL layers)
            /*var pan = OpenLayers.animation.pan({
              duration: 100,
              source: currentCenter
            });
            __olMap.beforeRender(pan);*/

            // check if command or control key is pressed
            if (e.metaKey || e.ctrlKey) {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] + (1 * PX_SMALL_PAN * SMALL_MULTIPLIER)]);
            } else {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] + (1 * PX_SMALL_PAN)]);
            }
            return false;
          }
          if (e.keyCode === DOWN) { // down arrow
            // check if command or control key is pressed
            if (e.metaKey || e.ctrlKey) {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] - (1 * PX_SMALL_PAN * SMALL_MULTIPLIER)]);
            } else {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] - (1 * PX_SMALL_PAN)]);
            }
            return false;
          }
          if (e.keyCode === LEFT) { // left arrow
            // check if command or control key is pressed
            if (e.metaKey || e.ctrlKey) {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] - (1 * PX_SMALL_PAN * SMALL_MULTIPLIER), currentCenter[1]]);
            } else {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] - (1 * PX_SMALL_PAN), currentCenter[1]]);
            }
            return false;
          }
          if (e.keyCode === RIGHT) { // right arrow
            // check if command or control key is pressed
            if (e.metaKey || e.ctrlKey) {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] + (1 * PX_SMALL_PAN * SMALL_MULTIPLIER), currentCenter[1]]);
            } else {
              MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] + (1 * PX_SMALL_PAN), currentCenter[1]]);
            }
            return false;
          }
          if (e.keyCode === PAGE_UP) {
            // page up
            MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] + (1 * PX_SMALL_PAN * LARGE_MULTIPLIER)]);
            return false;
          }
          if (e.keyCode === PAGE_DOWN) {
            // page down
            MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0], currentCenter[1] - (1 * PX_SMALL_PAN * LARGE_MULTIPLIER)]);
            return false;
          }
          if (e.keyCode === HOME) {
            // home
            MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] - (1 * PX_SMALL_PAN * LARGE_MULTIPLIER), currentCenter[1]]);
            return false;
          }
          if (e.keyCode === END) {
            // right arrow
            MapHelper.setCurrentMapCentre(__olMap, [currentCenter[0] + (1 * PX_SMALL_PAN * LARGE_MULTIPLIER), currentCenter[1]]);
            return false;
          }

        };

        var onKeyUp = function (e) {
          if (!allowKeyPress)
            return false;
          if (e.keyCode === COMMAND) {
            isCommandDown = false;
          }
          if (e.keyCode === CONTROL) {
            isControlDown = false;
          }
        };

        //bind keyboard events when hovering inside, unbind when leaving
        $mapSelector.mouseover(
          function () {
            $(document).keydown(onKeyDown);
            $(document).keyup(onKeyUp);
          }
        );

        $mapSelector.mouseout(
          function () {
            $(document).unbind('keydown', onKeyDown);
            $(document).unbind('keyup', onKeyUp);
          }
        );

        //bind to OpenLayers zoom events and publish
        __olMap.getView().on('change:resolution', function () {
          zoomManager.zoom(undefined, undefined, true);
          //Update zoom indicator
          zoomEndPublish();
        });
      };

      var center = proj4('EPSG:4326', mapProj.name, [mapdsConfig.MapOptions.CentreLong, mapdsConfig.MapOptions.CentreLat]),
        view = new OpenLayers.View({
          maxZoom: mapdsConfig.MapOptions.ZoomLevels,
          minZoom: 0,
          projection: mapProj.name
        });

      view.setProperties({
        maxZoom: mapdsConfig.MapOptions.ZoomLevels
      });

      if (mapdsConfig.Layers.Google) {
        initializeGoogleMap(center, view, mapdsConfig.Layers.Google);
      } else {
        view.setCenter(center);
        view.setZoom(mapdsConfig.MapOptions.DefaultZoom);
      }

      __olMap = new OpenLayers.Map({
        target: $mapSelector[0],
        layers: layerCollection,
        interactions: OpenLayers.interaction.defaults({
          altShiftDragRotate: false,
          dragPan: false,
          MouseWheelZoom: false,
          pinchRotate: false
        }).extend([
          new OpenLayers.interaction.DragPan({
            kinetic: new OpenLayers.Kinetic(-0.030, 0.05, 100) //OL3 defaults:  -0.005, 0.05, 100
          }),
          new OpenLayers.interaction.MouseWheelZoom({
            duration: 250
          })
        ]),
        view: view
      });

      initZoomControls();

      // Listen for interesting events
      eventSubscribe();
      eventPublish();
      if (!window.Modernizr.touch) {
        // Register tooltips for non-touch devices only.
        $('[rel=tooltip]').tooltip({
          delay: 0
        });
      }
      initialised = true;
      return this;
    };

    var initializeGoogleMap = function initializeGoogleMap(center, view, googleConfigs) {
      var trafficString = 'Google Traffic',
        trafficLayerVisible = false,
        hasGoogleTraffic = false,
        googleRoadmapType = 'roadmap',
        googleSatelliteType = 'satellite',
        googleHybridType = 'hybrid',
        googleTerrainType = 'terrain',
        mapTypeIds = [];

      _.each(googleConfigs, function (config) {
        if (config.ExternalLayerName === trafficString) {
          hasGoogleTraffic = true;
          if (config.Visible) trafficLayerVisible = true;
        } else if (config.Type === googleRoadmapType) {
          mapTypeIds.push(google.maps.MapTypeId.ROADMAP);
        } else if (config.Type === googleSatelliteType) {
          mapTypeIds.push(google.maps.MapTypeId.SATELLITE);
        } else if (config.Type === googleHybridType) {
          mapTypeIds.push(google.maps.MapTypeId.HYBRID);
        } else if (config.Type === googleTerrainType) {
          mapTypeIds.push(google.maps.MapTypeId.TERRAIN);
        } else {
          return;
        }
      });

      gmap = new google.maps.Map($('#gmap')[0], {
          disableDefaultUI: true,
          keyboardShortcuts: false,
          draggable: false,
          disableDoubleClickZoom: false,
          scrollwheel: false,
          streetViewControl: false,
          mapTypeControl: true,
          tilt: 0,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: mapTypeIds,
            position: google.maps.ControlPosition.LEFT_BOTTOM
          }
        });

      if (hasGoogleTraffic) {
        trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.set('isGoogleTraffic', true);
        trafficLayer.set('name', trafficString);
        if (trafficLayerVisible) trafficLayer.setMap(gmap);
      }

   var moveGoogleComponentsToOpenlayersDiv = function() {
   
		var checkResourcesConfig = setInterval(function() {
			var $parent = $('.map.noselect');
				var $mapTypeControl = $('.gm-style-mtc');
				var $mapTypeControlParent = $mapTypeControl.parent()[0];
				
				if (typeof $mapTypeControlParent !== "undefined") {
					clearInterval(checkResourcesConfig);
						
					if ($parent && $mapTypeControl && $mapTypeControlParent) {
						$parent.append($mapTypeControlParent);
					}
				}
		}, 200);

		var $parent = $('.map.noselect');
        var $termsOfUseLabel = $('#gmap .gmnoprint.gm-style-cc')[0];
        if ($parent && $termsOfUseLabel) {
            $parent.append($termsOfUseLabel);
        }
        var $reportAMapErrorLabel = $('#gmap .gm-style-cc');
        if ($parent && $reportAMapErrorLabel.length > 2) {
            $parent.append($reportAMapErrorLabel[2]);
        }

        var $googleLogo = $('#gmap .gm-style').children()[1];
        if ($parent && $googleLogo) {
            $parent.append($googleLogo);
        }
	  };

      // This is necessary for the first time the page is loaded
      google.maps.event.addListenerOnce(gmap, 'idle', moveGoogleComponentsToOpenlayersDiv);

      // The following two are necessary when the window is resized
      google.maps.event.addListener(gmap, 'bounds_changed', moveGoogleComponentsToOpenlayersDiv);
      google.maps.event.addListener(gmap, 'resize', moveGoogleComponentsToOpenlayersDiv);

      //These bind the panning and zooming events in the OpenLayers map to the Google map
      view.on('change:center', function () {
        center = proj4(mapProj.name, 'EPSG:4326', view.getCenter());
        gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
      });

      view.on('change:resolution', function () {
        gmap.setZoom(view.getZoom());
      });

      view.setCenter(center);
      view.setZoom(mapdsConfig.MapOptions.DefaultZoom);
      service = new google.maps.places.PlacesService(gmap);
    };

    var gotoAddress = function gotoAddress(datum) {
      if (service && datum.place_id) {
        service.getDetails({
          'placeId': datum.place_id
        }, function (results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            var geometry = results.geometry,
              bbox = geometry.bounds || geometry.viewport,
              point = results.geometry.location;

            if (bbox) {
              var ne = bbox.getNorthEast(),
                sw = bbox.getSouthWest(),
                bounds = [sw.lng(), sw.lat(), ne.lng(), ne.lat()];

              bounds = MapHelper.transformExtent(bounds, wgs84CoordinateSystem.getCode(), mapProj.name);
              MapHelper.fitMapToBounds(__olMap, bounds);
            } else {
              var p = [point.lng(), point.lat()],
                zoom = mapdsConfig.defaultZoomTo || 17;
              p = OpenLayers.proj.fromLonLat(p, mapProj.name);
              if (MapHelper.getCurrentZoomLevel() !== zoom) {
                MapHelper.setCurrentMapCentreAndZoom(__olMap, p, zoom);
              } else {
                MapHelper.setCurrentMapCentre(__olMap, p);
              }
            }
          }
        });
      }
    };


    var createAlertPopup = function createAlertPopup() {
      $popUpAlertSelector = $(alertPopupTemplate).html('');

      // account for if we've got the map-toolbar visible and offset down accordingly.
      if ($('.map-toolbar', $mapSelector.parent()).length) {
        $popUpAlertSelector.css('top', parseInt($('.map-toolbar', $mapSelector.parent()).css('height')) + 4 + 'px');
      }
      //Add the popup
      $mapSelector[0].appendChild($popUpAlertSelector[0]);
    };

    var forceMapRefresh = function forceMapRefresh() {
      //first force layer to reload
      var active = [],
        layer;

      __olMap.getLayers().forEach(function (element) {
        if (element.getVisible) {
          active.push(element);
        }
      });

      layer = active[0];

      //update map size
      __olMap.updateSize();

      //setting visibility to true forces a reload of the layer
      layer.setVisible(false);
      layer.setVisible(true);
    };

    var sortLayers = function(layerDefs, result) {
      _.each(layerDefs, function(layerDef) {
        var layerDefType = typeof layerDef;
        if (layerDefType === 'string') {
          _.each(MapHelper.getMapLayers(), function(layer) {
            if (MapHelper.getLayerName(layer) === layerDef) {
              result.push(layer);
            }
          })
        } else if (layerDefType === 'object') {
          sortLayers(layerDef.Layers, result);
        }
      });
    };


    var sortOverlays = function sortOverlays() {

      var layerOrder = mapdsConfig.LayerOrder;
      var overlayLayers;
      var sortedOverlayLayers = [];
      var baseLayers;
      var overlayLayers;
      var otherLayers;
      var finalOrderedLayers;
      if (layerOrder === undefined) return true;
      baseLayers = MapHelper.getBaseLayers(),
      overlayLayers = MapHelper.getNonBaseLayers();
      sortLayers(layerOrder, sortedOverlayLayers);
      // reverse the stack, the last on the list has top render priority
      sortedOverlayLayers.reverse();
      // Put undefined layers on top priority ( probably added after creation)
      // These are layers that are defined but not included in the layerOrder config.
      otherLayers = _.difference(overlayLayers, sortedOverlayLayers);
      // Now assemble the finalOrderedLayers. The entries will be rendered in order.
      // The order is base layers, then layers in the LAyerOrder Config and then the others
      // (layers that were not included in the layer order)

      finalOrderedLayers = baseLayers.concat(sortedOverlayLayers, otherLayers);

      //Update order in OL indexes
      $.each(finalOrderedLayers, function (index, layer) {
        MapHelper.setLayerIndex(__olMap, layer, index);
      });
    };

    var displayAlert = function displayAlert(text) {
      if ($popUpAlertSelector === null) {
        createAlertPopup();
      }
      clearBusyCursor();
      //if the alert popup is not displayed already create it
      if ($popUpAlertSelector.css('display') === 'none') {

        //re center popup
        $popUpAlertSelector.html(text);
        $popUpAlertSelector[0].style.left = ($mapSelector.width() / 2 - $popUpAlertSelector.width() / 2) + 'px';

        //display alert popup and fade it out
        $popUpAlertSelector.fadeIn(0, function () {
          $popUpAlertSelector.delay(1500).fadeOut(1000);
        });
      }
    };

    //Zoom Manager
    var zoomManager = (function () {
      //Private
      var zoomLevel,
        isZoomingIn = false,
        reset = function reset() {
          zoomLevel = MapHelper.getCurrentZoomLevel();
        },
        isItZoomingIn = function isItZoomingIn() {
          var isItTrue = false,
            currentZoomLevel = MapHelper.getCurrentZoomLevel();
          if (!zoomLevel) {
            zoomLevel = currentZoomLevel;
          }
          isItTrue = currentZoomLevel - zoomLevel >= 0;
          zoomLevel = currentZoomLevel;
          return isItTrue;
        },
        handleZoom = function handleZoom(newPosition, zoomMultiplier) {
          zoomMultiplier = typeof zoomMultiplier !== 'undefined' ? zoomMultiplier : 1;
          if (isInitialised()) {
            var newZoomLevel = MapHelper.getCurrentZoomLevel(),
              delta = (1 * zoomMultiplier);
            if (isZoomingIn) {
              newZoomLevel += delta;
            } else {
              newZoomLevel -= delta;
            }
            MapHelper.setCurrentZoomLevel(__olMap, newZoomLevel);
            zoomLevel = newZoomLevel;
          }
        },
        moveToOtherView = function moveToOtherView() {
          var numberOfZooms = MapHelper.getNumberOfZoomLevels();
          if (isZoomingIn) {
            if (numberOfZooms <= zoomLevel) {
              {
                $.publish('zoomInPastMax', [__olMap, name]);
                setBusyCursor();
              }
            }
          }
        },
        zoomingIn = function zoomingIn() {
          isZoomingIn = true;
        },
        zoomingOut = function zoomingOut() {
          isZoomingIn = false;
        },
        zoom = function zoom(newPosition, zoomMultiplier, isMouseZoom) {
          if (isMouseZoom) {
            isZoomingIn = isItZoomingIn();
          } else {
            handleZoom(newPosition, zoomMultiplier);
          }
          moveToOtherView();
        };

      return {
        zoom: zoom,
        zoomingIn: zoomingIn,
        zoomingOut: zoomingOut,
        reset: reset
      };
    })(); //end of zoomManager definition


    var setBusyCursor = function setBusyCursor() {
      $mapSelector.addClass('busy');
    };

    var clearBusyCursor = function clearBusyCursor() {
      $mapSelector.removeClass('busy');
    };

    var olMap = function olMap() {
      return __olMap;
    };

    var isInitialised = function isInitialised() {
      return initialised;
    };

    var removeControls = function removeControls() {
      //deactivate all map controls
      $.each(__olMap.controls, function (index, control) {
        //mousewheel handler is inside a control
        if (control.mouse) {
          control.mouse.deactivate();
        }
        control.deactivate();
      });
      //deactivate keyboard zooming
      $mapSelector.off('mouseenter mouseleave');
    };

    var getMapSelector = function getMapSelector() {
      return $mapSelector;
    };

    var getContainerSelector = function getContainerSelector() {
      return $containerSelector;
    };

    var googleToOLPosition = function googleToOLPosition(googlePosition) {
      var olPos = new OpenLayers.LonLat(googlePosition.lng(), googlePosition.lat()),
        transformedPos = MapHelper.transformToMapProjection(olPos);

      return transformedPos;
    };

    $.fn.initializeMapWithOptionsOnly = function initializeMapOptions(option) {
      return this.each(function () {
        var $elementSelector = $(this);

        //recreate a module instance and bind it to the current element
        this.map = new MapDSMap($, _, option, MapHelper, google, OpenLayers, proj4, mapdsLayerCreator).initialize($elementSelector);
      });
    };

    $.fn.initializeMap = function initializeMap(option) {
      return this.each(function () {
        var $elementSelector = $(this);
        //if map options are provided merge with the default config
        if (option) {
          $.extend(true, mapdsConfig, option);
        }

        //recreate a module instance and bind it to the current element
        this.map = new MapDSMap($, _, mapdsConfig, MapHelper, google, OpenLayers, proj4, mapdsLayerCreator).initialize($elementSelector);
      });
    };

    var api = {
      getMapSelector: getMapSelector,
      googleToOLPosition: googleToOLPosition,
      initialize: init,
      isInitialised: isInitialised,
      olMap: olMap,
      removeControls: removeControls
    };

    api.__TEST_ONLY__ = {
      onStreetViewExit: onStreetViewExit,
      disableCursor: function () {
        setBusyCursor = function () {};
        clearBusyCursor = function () {};
      },
      enableCursor: function () {
        setBusyCursor = function () {
          $mapSelector.addClass('busy');
        };
        clearBusyCursor = function () {
          $mapSelector.removeClass('busy');
        };
      },
      sortLayers: sortLayers,
      sortOverlays: sortOverlays
    };

    return api;
  });
