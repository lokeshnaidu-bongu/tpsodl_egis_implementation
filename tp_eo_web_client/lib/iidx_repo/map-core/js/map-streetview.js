'use strict';
define(['jquery',
    'map-google',
    'OpenLayers3',
    'map-core',
    'map-helper',
    'map-core-component/pubsub'
  ],

  function MapDSStreetView($, google, OpenLayers, mapDSCore, MapHelper, pubSub, isInstance) {

    var streetViews = [],
      mapConfig = MapHelper.getMapConfig(),
      wgs84String = 'EPSG:4326',
      mapProj = MapHelper.getMapProjection(),
      streetViewPrecision = 50,
      defaultZoomChange = 0.5,
      mapName,
      streetViewPanorama,
      $streetViewSelector,
      $mapSelector,
      $containerSelector,
      isStreetViewEmbedded,
      streetViewTemplate = '<div id="streetview" class="map streetview"></div>',
      alertPopupText = 'Street View not available at this location';

    var eventSubscribe = function eventSubscribe() {
      if (!isInstance) {
        $.subscribe('mapInitialised', function (mapName, olMap) {
          var $map = $('.map[data-map-name="' + mapName + '"]');
          var toggle = $map.data('toggle');
          if (toggle && toggle.indexOf('streetview') !== -1) {
            streetViews.push(new MapDSStreetView($, google, OpenLayers, mapDSCore, MapHelper, pubSub, true).init(mapName, olMap));
          }
        });
      }
    };

    var init = function init(targetMapName, olMap, $streetViewTarget) {
      if (!google)
        return;
      //don't let instances listen to created maps
      $.unsubscribe('mapInitialised');
      mapName = targetMapName;
      $containerSelector = $('.map[data-map-name="' + mapName + '"]');

      $mapSelector = $containerSelector.children(".mapdsMap");

      var mapCentre = MapHelper.getCurrentMapCentre(olMap),
        mapCentreLonLat = OpenLayers.proj.transform(mapCentre, mapProj.name, wgs84String),
        initalStreetViewPos = new google.maps.LatLng(mapCentreLonLat[0], mapCentreLonLat[1]);

      //generate streetview markup dynamically
      var idNumber = $('.streetview').length + 1,
        uniqueTemplate = streetViewTemplate.replace('id="streetview', 'id="streetview' + idNumber.toString());

      //build streetview div
      $streetViewSelector = $(uniqueTemplate);

      if (!$streetViewTarget) {
        setEmbeddedInMap(true);
        $containerSelector[0].appendChild($streetViewSelector[0]);
      } else {
        setEmbeddedInMap(false);
        $streetViewTarget[0].appendChild($streetViewSelector[0]);
      }

      var panoramaOptions = {
        position: initalStreetViewPos,
        addressControl: false,
        panControl: false,
        zoomControl: false,
        disableDoubleClickZoom: true,
        scrollwheel: false,
        pov: {
          heading: 165,
          pitch: 10,
          zoom: 0
        }
      };

      streetViewPanorama = new google.maps.StreetViewPanorama($streetViewSelector[0], panoramaOptions);
      streetViewPanorama.setVisible(true);
      $streetViewSelector.hover(function () {
        $streetViewSelector.bind('mousewheel', mouseWheelHandler);
      }, function () {
        $streetViewSelector.unbind('mousewheel');
      });

      $.subscribe('zoomInPastMax', function (olMap, targetMapName) {

        if (targetMapName === mapName && isStreetViewEnable()) {
          searchForPanorama(MapHelper.getCurrentMapCentre(olMap), streetViewPrecision);
        }
      });

      return this;
    };

    var isStreetViewEnable = function () {
      var enabled = true; // by Defaults
      if (mapConfig && mapConfig.StreetView) {
        enabled = mapConfig.StreetView.Enabled;
        if (enabled === undefined) {
          enabled = true;
        }
      }
      return enabled;
    };

    var forceRefresh = function forceRefresh() {
      streetViewPanorama.setVisible(false);
      streetViewPanorama.setVisible(true);
      streetViewPanorama.setPov(streetViewPanorama.getPov());
    };

    var mouseWheelHandler = function mouseWheelHandler(e) {
      //handles zooming on streetview and quiting
      var zoomLevel = streetViewPanorama.getZoom();
      if (e.originalEvent.wheelDelta < 0) {
        if (zoomLevel === 0) {
          exit();
        } else {
          streetViewPanorama.setZoom(zoomLevel - defaultZoomChange);
        }
      } else {
        streetViewPanorama.setZoom(zoomLevel + defaultZoomChange);
      }
      e.preventDefault();
    };

    var getCentre = function getCentre() {
      return streetViewPanorama.position;
    };

    var searchForPanorama = function searchForPanorama(mapCentre, precision) {
      var longlat = OpenLayers.proj.transform(mapCentre, mapProj.name, wgs84String),
        newPos = new google.maps.LatLng(longlat[1], longlat[0]),
        sv = new google.maps.StreetViewService();
      sv.getPanoramaByLocation(newPos, precision, processResult);
    };

    var isEmbeddedInMap = function isEmbeddedInMap() {
      return isStreetViewEmbedded;
    };

    var setEmbeddedInMap = function setEmbeddedInMap(booleanVal) {
      isStreetViewEmbedded = booleanVal;
    };

    var selector = function selector() {
      return $streetViewSelector;
    };

    var processResult = function processResult(data, status) {
      if (status === google.maps.StreetViewStatus.OK) {
        streetViewPanorama.setPosition(data.location.latLng);
        enter();

        var $zoomIndicator = $(".zoom_out", $containerSelector);

        var exitSVClick = function () {
          exit();
          $zoomIndicator.unbind('mousedown', exitSVClick);
        };

        $zoomIndicator.on('mousedown', exitSVClick);

      } else if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
        $.publish('mapPopupAlert', [alertPopupText, mapName]);
      }
    };

    var enter = function enter(callback) {
      if (isEmbeddedInMap()) {
        // Google Map is inside gmap container
        $('.popover').hide();

        // This will remove the sidebar and controls which are not applicable to street view.
        $.publish('streetViewEnter');
        // Force StreetView to recreate some of the standard labels (Report a problem, copyright...)
        // As sometimes they are displayed on top of each other
        google.maps.event.trigger(streetViewPanorama, 'resize');

        $("#gmap").fadeOut(250, function () {
          selector().fadeIn(250, function () {
            forceRefresh();
            if (callback) {
              callback();
            }
          });
        });
      }
    };

    var exit = function exit(callback) {
      var streetviewPosition = streetViewPanorama.getPosition(),
        lonLatPos = [streetviewPosition.lng(), streetviewPosition.lat()];

      if (isEmbeddedInMap()) {
        $('.popover').show();
        selector().fadeOut(250, function () {
          $("#gmap").fadeIn(250, function () {
            // Publish event after fadeIn()
            $.publish('streetViewExit', [selector(), MapHelper.transformToMapProjection(lonLatPos), mapName]);
            if (callback) {
              callback();
            }
          });
        });
      } else {
        $.publish('streetViewExit', [selector(), MapHelper.transformToMapProjection(lonLatPos), mapName]);
      }
    };

    var getPanorama = function getPanorama() {
      return streetViewPanorama;
    };

    var show = function show() {
      selector().show();
    };

    var hide = function hide() {
      selector().hide();
    };

    var getStreetViews = function getStreetViews() {
      return streetViews;
    };

    var getMapName = function getMapName() {
      return mapName;
    };

    // Listen for interesting events
    eventSubscribe();

    return ({
      enter: enter,
      exit: exit,
      getCentre: getCentre,
      init: init,
      hide: hide,
      show: show,
      isEmbeddedInMap: isEmbeddedInMap,
      searchForPanorama: searchForPanorama,
      getPanorama: getPanorama,
      selector: selector,
      setEmbeddedInMap: setEmbeddedInMap,
      getStreetViews: getStreetViews,
      getMapName: getMapName
    });

  });
