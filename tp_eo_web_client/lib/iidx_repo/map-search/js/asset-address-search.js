define(['jquery', 'typeahead', 'map-search-component/indexer', 'hogan', 'OpenLayers3', 'map-core-component/pubsub', 'comms'],

  function AssetAddressSearch($, typeahead, indexr, hogan, OpenLayers, pubsub, CommsLayer) {
    'use strict';

    var searchAddresses = function searchAddresses(options) {
      return function searchAddressesTypeahead(query, cb) {
        var service = new google.maps.places.AutocompleteService(),
          olMap = options.olMap,
          bbox, ne, sw,
          bounds;
        if (olMap) {
          bbox = OpenLayers.proj.transformExtent(olMap.getView().getProjection().getExtent(), olMap.getView().getProjection(), 'EPSG:4326');
          ne = new google.maps.LatLng(bbox.top, bbox.right);
          sw = new google.maps.LatLng(bbox.bottom, bbox.left);
          bounds = new google.maps.LatLngBounds(sw, ne);
        }
        service.getPlacePredictions({
          input: query,
          bounds: bounds
        }, function (predictions, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var results = $.map(predictions, function (prediction) {
              return {
                value: prediction.description,
                place_id: prediction.place_id
              };
            });
            cb(results);
          }
        });
      }
    };

    var searchAssetIndex = function searchAssetIndex(options) {
      return function searchAssetTypeahead(query, cb) {
        var results = indexr.searchIndex(query, options.isFaceted, options.items);
        var facetsSeen = {};
        results = $.map(results, function (result, index) {
          if (options.isFaceted) {
            if (index === 0) {
              //override the facet for the first result to put it in its own category
              result.secondaryInfo = result.facet + ", " + result.location;
              result.facet = options.topResultText;
            }
            if (!facetsSeen[result.facet]) {
              if (index > 0) {
                result.firstOfFacet = true; //for styling, but don't treat "top result" like a real facet in the css
              }
              result.displayFacet = result.facet;
              facetsSeen[result.facet] = true;
            }
            result.secondaryInfo = result.location;
            return result;
          } else {
            return {
              value: result
            };
          }
        });

        cb(results);
      }
    };

    var gotoAddressCallback = function gotoAddressCallback(datum, options) {
      for (var i = 0; i < options.mapNames.length; i++) {
        gotoAddress(datum, options.mapNames[i]);
      }
    };

    var gotoAddress = function gotoAddress(val, mapName) {
      if (val) {
        $.publish('gotoAddress', [val, mapName]);
      }
    };

    var gotoAsset = function gotoAsset(datum) {
      indexr.gotoAsset(datum.value, datum.id);
    };

    /* *
     * Jquery plugin entry point.  Options will be passed as the first argument into Twitter Typeahead.js
     *
     *
     * @param {Object} options Any valid Twitter Typeahead.js options + the following optional ones
     *  @config {Function} [source] If provided and no "datasets" are passed, configures a default dataset that uses the source function as a source
     *  @config {String} [type] Predefined type "asset" or "address" which default to their own "source" functions
     *  @config {boolean} [isFaceted] Whether the typeahead results contain faceted / category data
     *  @config {Function} [viewItemCallback] Callback to execute upon selecting a typeahead result
     * @param {Object*} [dataset] Optional n Twitter typeahead dataset objects to use. Optional if a "type" or "source" is set in options above.
     */
    $.fn.assetOrAddressSearch = function assetOrAddressSearch(options, dataset) {

      var resolvedOptions = $.extend({}, defaults, options);

      if (resolvedOptions.type == 'asset') {
        if (typeof resolvedOptions.isFaceted === 'undefined') {
          resolvedOptions.isFaceted = true;
        }
        resolvedOptions.source = searchAssetIndex(resolvedOptions);
        resolvedOptions.viewItemCallback = gotoAsset;
      } else if (resolvedOptions.type == 'address') {
        if (resolvedOptions.isFaceted !== true) {
          resolvedOptions.isFaceted = false;
        }
        resolvedOptions.source = searchAddresses(resolvedOptions);
        resolvedOptions.viewItemCallback = gotoAddressCallback;
      } else {
        if (typeof resolvedOptions.isFaceted === 'undefined') {
          resolvedOptions.isFaceted = false;
        }
        //must either provide "source" in options OR one or more dataset arguments for typeahead.
      }

      if (resolvedOptions.isFaceted) {
        var suggestionTemplate = hogan.compile([
          '<div class="tt-faceted-result {{#firstOfFacet}}first-of-facet{{/firstOfFacet}}">',
          '<div class="nowrap-container">',
          '<span class="tt-facet-name">{{displayFacet}}</span>',
          '<p class="tt-faceted-suggestion">',
          '<span>{{value}}{{#secondaryInfo}} ({{secondaryInfo}}){{/secondaryInfo}}</span>',
          '</p>',
          '</div>',
          '</div>'
        ].join(''));
        resolvedOptions.defaultDatasetTemplates = {
          suggestion: $.proxy(suggestionTemplate.render, suggestionTemplate)
        }
      }

      var allArgs = [resolvedOptions];

      if (arguments.length > 1) {
        allArgs = allArgs.concat(Array.prototype.slice.call(arguments, 1));
      } else {
        allArgs.push({
          name: 'default' + (resolvedOptions.isFaceted ? '-faceted-dataset' : ''),
          displayKey: 'value',
          templates: resolvedOptions.defaultDatasetTemplates || null,
          source: resolvedOptions.source
        });
      }

      this.each(function () {
        var $this = $(this);
        $this.focus();

        //Remove existing typeaheads here.
        $this.unbind('typeahead:selected');
        $this.typeahead('destroy');
        $this.typeahead.apply($this, allArgs).bind('typeahead:selected', function (evt, datum) {
          resolvedOptions.viewItemCallback(datum, resolvedOptions);
        });
      });
    };

    var defaults = {
      type: 'address',
      items: 10,
      highlight: true,
      mapNames: ['default'],
      offsetPosY: 13,
      topResultText: "Top Result"
    };

    return {
      gotoAsset: gotoAsset,
      gotoAddress: gotoAddress,
      options: defaults
    };
  });
