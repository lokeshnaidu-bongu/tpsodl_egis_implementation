define(['jquery',
    'OpenLayers3',
    'map-helper',
    'map-markers-component/map-marker-types',
    'd3-amd',
    'map-popovers',
    'map-core-component/pubsub'
  ],

  function Overlay($, OpenLayers, MapHelper, mapMarkerTypes, d3, popovers) {
    'use strict';

    var generatedId = 0;

    function OverlayConstructor(collection, map, name, isMarker, indexOptions) {

      var div,
        svg,
        g,
        path,
        feature,
        layerData,
        bounds,
        ctx = this,
        overlays = [],
        deferred = $.Deferred();

      var iconSet = (function () {
        var getX = function (d) {
          return ((typeof d.metadata === 'undefined') || (typeof d.metadata.iconPos === 'undefined')) ? -7 : d.metadata.iconPos.x;
        };

        var getY = function (d) {
          return ((typeof d.metadata === 'undefined') || (typeof d.metadata.iconPos === 'undefined')) ? 5 : d.metadata.iconPos.y;
        };

        var getIcon = function (d) {
          var unicodeId = '';

          if (typeof d.metadata !== 'undefined') {
            unicodeId = d.metadata.icon;

            if (d.metadata.size === 'mini') {
              unicodeId = '';
            }
          }

          return unicodeId;
        };

        return ({
          getIcon: getIcon,
          getX: getX,
          getY: getY
        });
      })();

      var getId = function (d) {
        if (typeof d.id === 'undefined') {
          d.id = 'id' + generatedId++;
        }

        return d.id;
      };

      var $mapContainer = $(map.getTarget().parentElement),
        searchOptions = indexOptions,
        svgElement = (function () {
          if (isMarker) {
            return 'g';
          } else {
            return 'path';
          }
        })();

      this.$mapcontainer = function () {
        return $mapContainer;
      };
      this.overlays = function () {
        return overlays;
      };
      this.feature = function () {
        return feature;
      };
      this.collection = function () {
        return collection;
      };
      this.searchOptions = function () {
        return searchOptions;
      };
      this.updateLayerData = function (data) {
        updateLayerData(data);
      };

      $.subscribe('gotoAsset', function (d3Overlay, feature) {
        // select the marker
        if (d3Overlay.overlays() === overlays) {
          d3Overlay.feature().on('click')(feature);

          // goto location
          var coords = feature.geometry.coordinates;
          MapHelper.setCurrentMapCentre(map, MapHelper.transformToMapProjection(coords));
        }
      });

      var getFeatureState = function (d) {
        if (isMarker) {
          return (typeof d.metadata === 'undefined') ? '' : d.metadata.state;
        } else {
          return d.geometry.type.toLowerCase();
        }
      };

      var getCSSClass = function () {
        if (isMarker) {
          return 'marker';
        } else {
          return 'vector';
        }
      };

      var getFeaturePointTranslation = function getFeaturePointTranslation(d) {
        var pathString = path(d),
          floatString = pathString.slice(1, pathString.indexOf('m')),
          translateString = 'translate(' + floatString + ')';
        return translateString;
      };

      function createD3Layer(data) {
        var half_size = 42,
          size = 2 * half_size,
          f_mouseover = function () {
            d3.select(this)
              .classed('active', true);
          },
          f_mouseout = function () {
            d3.select(this)
              .classed('active', false);
          },
          f_dblclick = function () {
            if (isMarker) {
              d3.event.stopPropagation();
            }
          };

        for (var i = 0; i < data.features.length; i++) {
          var f = data.features[i];

          svg = div.append('svg')
            .attr('width', size)
            .attr('height', size);

          svg.append('g')
            .datum(f)
            .attr('class', getFeatureState)
            .attr('id', getId)
            .classed(getCSSClass(), true)
            .attr('transform', 'translate(' + half_size + ',' + half_size + ')')
            .on('mouseover', f_mouseover)
            .on('mouseout', f_mouseout)
            .on('dblclick', f_dblclick);
        }

        feature = div.selectAll('g');

        if (isMarker) {
          feature.each(function (d) {
            var thisMarker = this.appendChild(mapMarkerTypes.getSVGElement(d).cloneNode(true)),
              position = MapHelper.transformToMapProjection(d.geometry.coordinates),
              marker;
            d3.select(thisMarker)
              .datum(d)
              .attr('x', mapMarkerTypes.getTranslateX)
              .attr('y', mapMarkerTypes.getTranslateY);

            // draw the icon
            d3.select(this).append('text')
              .datum(d)
              .style('font-family', 'ge-iconography-legacy-webfont, ge-iconography-webfont')
              .style('font-size', '14px')
              .attr('x', iconSet.getX)
              .attr('y', iconSet.getY)
              .attr('fill', 'white')
              .text(iconSet.getIcon);

            marker = new OpenLayers.Overlay({
              position: position,
              positioning: 'center-center',
              element: thisMarker.parentNode.parentNode,
              stopEvent: false
            });
            marker.set('name', name);
            map.addOverlay(marker);
            overlays.push(marker);
          });
        }
      }

      var updateLayerData = function updateLayerData(data) {
        popovers.removePopovers(map, data);
        div = d3.selectAll('[id="' + map.getTarget().id + '"]');
        div.selectAll('svg').remove();

        function project(x) {
          return MapHelper.transformToMapProjection(x);
        }

        path = d3.geo.path().projection(project);
        bounds = path.bounds(data);

        if (isMarker) {
          mapMarkerTypes.loadSVGMarkerElements();

          mapMarkerTypes.done(function () {
            createD3Layer(data);
            deferred.resolve(ctx);
          });
        } else {
          createD3Layer(data);
        }
      };

      updateLayerData(collection);

      return deferred.promise(this);
    }
    return OverlayConstructor;
  });
