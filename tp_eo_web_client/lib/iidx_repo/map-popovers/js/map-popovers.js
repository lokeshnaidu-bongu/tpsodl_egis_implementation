'use strict';
define([
    'jquery',
    'map-helper',
    'd3-amd',
    'hogan',
    'map-markers-component/map-marker-types',
    'text!map-popovers-partials/mapPopovers.html',
    'OpenLayers3',
    'ge-bootstrap',
    'map-core-component/pubsub'
  ],

  function Popovers($, MapHelper, d3, hogan, markerTypes, template, OpenLayers) {
    var options = {
        popovers: false,
        popoverTemplate: template
      },
      popoverOverlayId = 'popoverOverlay';

    /**
     * Creates a popover, and an overlay. Associate the popover with the overlay.
     * Remove all other popovers and overlays.
     * @memberof module:Popovers
     * @public
     */
    var addPopovers = function addPopovers(map, overlayName, feature, collection) {
      function project(x) {
        return MapHelper.transformToMapProjection(x);
      }

      var path = d3.geo.path().projection(project),
        name = overlayName,
        popoverTemplate = hogan.compile(options.popoverTemplate),
        bounds = path.bounds(collection),
        $mapContainer = $(map.getTarget().parentElement);

      feature.on('touchend', handleInput);
      feature.on('click', handleInput);

      function handleInput(d) {
        //Temp toggle functionality
        var currentId = '#' + d.id,
          currentMarker = d3.select(currentId);

        if ((currentMarker.attr('class').search('selected') === -1) && (currentMarker.attr('class').search('cluster') === -1)) {
          currentMarker.classed('selected', true);

          //Add marker ID to properties object as the popoverID for targeting
          d.properties.popoverId = d.id;
          $.publish('markerSelected', [d]);

          if (options.popovers) {
            $($mapContainer).append(popoverTemplate.render(d.properties));

            //Update popover css
            var $popover = $('div[data-popover-id="' + d.id + '"]', $mapContainer);
            $popover.css('display', 'block');
            $('header', $popover).addClass(d.metadata.state);
          }

          if (d3.event) {
            d3.event.stopPropagation();
          }

          //Close any other popovers and deselect markers
          $('.popover:not(div[data-popover-id="' + d.id + '"])', $mapContainer).remove();
          feature.each(function (f) {
            var thisId = '#' + f.id;
            var thisMarker = d3.select(thisId);

            if (currentId !== thisId) {
              thisMarker.classed('selected', false);
            }
          });

          //Close on click away
          var handler = function () {
            currentMarker.classed('selected', false);
            $.publish('markerDeselected', [d]);
            if (options.popovers) {
              $popover.remove();
            }
            map.un('click', handler);
            map.un('touchend', handler);
          };

          map.on('click', handler);
          map.on('touchend', handler);

          //Allow clicking in popover itself
          if (options.popovers) {
            $popover.click(function (event) {
              event.stopPropagation();
            });
            popoverposition(d, true);
          }
        } else {
          currentMarker.classed('selected', false);
          $('div[data-popover-id="' + d.id + '"]', $mapContainer).remove();
        }
      }

      function popoverposition(d, opening) {
        var popover = $('div[data-popover-id="' + d.id + '"]', $mapContainer),
          left = Math.floor(-popover.width() / 2),
          top = Math.floor(-popover.height() - markerTypes.getPopoverOffset(d)) - 4,
          leftString = left + 'px',
          topString = top + 'px',
          position = MapHelper.transformToMapProjection(d.geometry.coordinates),
          popoverOverlay = map.getOverlayById(popoverOverlayId);

        popover.css('left', leftString);
        popover.css('top', topString);

        if (!popoverOverlay) {
          popoverOverlay = new OpenLayers.Overlay({
            id: popoverOverlayId,
            position: position,
            positioning: 'top-center',
            element: popover.get(0),
            stopEvent: false
          });
          popoverOverlay.set('name', name);
          map.addOverlay(popoverOverlay);
        } else {
          popoverOverlay.setElement(popover.get(0));
          popoverOverlay.setPosition(position);
        }

        if (opening) {
          map.updateSize();
          var mapCentre = calculateMapCentre(position, popover);
          MapHelper.setCurrentMapCentre(map, MapHelper.getCoordinateFromPixel(mapCentre));
        }
      }
    };

    var calculateMapCentre = function (position, popover) {
      var mapCentre = MapHelper.getPixelFromCoordinate(MapHelper.getCurrentMapCentre()),
        mapSize = MapHelper.getMapSize(),
        mapLeft = Math.floor(mapCentre[0] - mapSize[0] / 2),
        mapRight = Math.floor(mapCentre[0] + mapSize[0] / 2),
        mapTop = Math.floor(mapCentre[1] - mapSize[1] / 2),
        currentPos = MapHelper.getPixelFromCoordinate(position),
        popOverLeft = Math.floor(currentPos[0] - popover.width() / 2),
        popOverRight = Math.floor(currentPos[0] + popover.width() / 2),
        popOverTop = Math.floor(currentPos[1] - popover.height()),
        diffLeft = Math.floor(popOverLeft - 20 - mapTop),
        diffRight = Math.floor(popOverRight + 20 - mapRight),
        diffTop = Math.floor(popOverTop - 70 - mapTop);

      if (diffTop < 0) {
        mapCentre[1] = mapCentre[1] + diffTop;
      }
      if (diffLeft < 0) {
        mapCentre[0] = mapCentre[0] + diffLeft;
      } else if (diffRight > 0) {
        mapCentre[0] = mapCentre[0] + diffRight;
      }

      return mapCentre;
    };

    /**
     * Removes the popovers with their overlays.
     * @memberof module:Popovers
     * @public
     */
    var removePopovers = function (map) {
      var overlay = map.getOverlayById(popoverOverlayId);
      if (overlay) {
        overlay.getElement().remove();
        map.removeOverlay(overlay);
      }
    };

    var api = {
      popupOptions: options,
      removePopovers: removePopovers,
      addPopovers: addPopovers
    };

    /* test-code */
    api.__TEST_ONLY__ = {
      calculateMapCentre: calculateMapCentre
    };
    /* end-test-code */

    return api;
  });
