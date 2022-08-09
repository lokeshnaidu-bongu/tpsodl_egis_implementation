define([
  'jquery',
  'underscore',
  'map-helper',
  'hogan',
  'text!map-layer-list-partials/baseLayers.html',
  'text!map-layer-list-partials/overlayItem.html',
  'i18n!viewer/nls/messages',
  'map-loader',
  'ge-bootstrap'
],

  function LayerList($, _, MapHelper, hogan, baseTemplate, overlayItemTemplate, Messages, Config) {
    'use strict';

    var templateBaseContainer = hogan.compile(baseTemplate),
      templateOverlayItem = hogan.compile(overlayItemTemplate),
      currentMouseAction,
      mouseDown = false,
      gmap,
      gtraffic,
      gtrafficId = 'googleTraffic',
      gtrafficString = 'Google Traffic',
      overlayIdToLayerLookup = {};

    //Layer/Layer Group state management
    var baseLayerManager = (function () {
      //Private
      var baseLayerItems = [],
        reset = function reset() {
          baseLayerItems = [];
        },
        addLayers = function addLayers(layers) {
          reset();
          _.each(layers, function (layer) {
            var baseLayerItem,
              name = MapHelper.getLayerName(layer),
              id = MapHelper.getLayerId(layer),
              visible = MapHelper.getVisibility(layer),
              type = MapHelper.getLayerType(layer) || 'default';

            if (name) {
              baseLayerItem = {
                id: id,
                visibility: visible,
                type: type,
                name: name
              };
            } else {
              baseLayerItem = {
                id: 'unknown',
                visibility: visible,
                type: type,
                name: 'unknown'
              };
            }

            baseLayerItems.push(baseLayerItem);
          });
        },
        getLayers = function getLayers() {
          return baseLayerItems;
        };

      return {
        addLayers: addLayers,
        getLayers: getLayers,
        reset: reset
      };
    })(); //end of baseLayerManager definition
    //Layer/Layer Group state management
    var overlayManager = (function () {
      //Private
      var overlayItems = [];

      var createOverlayItems = function createOverlayItems($overlayList, overlayItems) {

        $overlayList.append(templateOverlayItem.render({
          layerDefs: overlayItems,
          Messages: Messages,
          layersExpanded: Config.LayerGroupExpanded || false
        }));

        bindItemEvents();
      };

      var bindItemEvents = function bindItemEvents() {
        $('.dropdown-menu li div .toggle-collapse').on('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var button = $(event.target)[0];
          var parentNode = $(button.parentNode.parentNode);

          if (!parentNode.hasClass('parent-node')) {
            return;
          }

          if (parentNode.hasClass('node-group-collapsed')) {
            parentNode.removeClass('node-group-collapsed');
            parentNode.addClass('node-group-expanded');
          } else {
            parentNode.removeClass('node-group-expanded');
            parentNode.addClass('node-group-collapsed');
          }

          var menu = $("div.btn-group.overlay-chooser.open>ul.dropdown-menu");
          menu.css('width', '');
          menu.css('width', menu.width() + 'px');
        });

        $('.dropdown-menu li div .layer-visibility').on('click', function (event) {
          event.stopPropagation();
          var node = $(event.target)[0];
          var parentNode = $(node.parentNode.parentNode);
          processLayerVisibility(parentNode);
        });

        $('.dropdown-menu li div label').on('click', function (event) {
          event.stopPropagation();
          var node = $(event.target)[0];
          var parentNode = $(node.parentNode.parentNode);
          processLayerVisibility(parentNode);
        });
      };

      var processLayerVisibility = function (node) {
        var itemId = node.data('itemId');
        setChildNodesVisibility(itemId);
        setParentNodesVisibility(itemId);
        refreshNodesVisibility(overlayItems);
      };

      var refreshNodesVisibility = function (items) {
        _.each(items, function (item) {
          var isVisible = item.visibility;
          var node = $('.dropdown-menu li[data-item-id="' + item.itemId + '"]');

          if (isVisible) {
            node.removeClass('disabled');
            node.addClass('enabled');
          } else {
            node.removeClass('enabled');
            node.addClass('disabled');
          }

          if (item.isGroup) {
            refreshNodesVisibility(item.layers);
          } else {

          }
        });
      };

      var getLayersByItemId = function (itemId, items, result) {
        for (var index = 0; index < items.length; index++) {
          var item = items[index];
          if (item.itemId === itemId) {
            result.push(item);
          } else if (item.isGroup) {
            getLayersByItemId(itemId, item.layers, result);
          }
        }
      };

      var getLayerByItemId = function (itemId, items) {
        var itemsById = [];
        getLayersByItemId(itemId, items, itemsById);
        if (itemsById.length > 0) {
          return itemsById[0];
        }
        return null;
      };

      var setChildNodesVisibility = function (itemId) {
        var node = getLayerByItemId(itemId, overlayItems);
        if (!node) {
          return;
        }

        var targetStatus = !node.visibility;
        var childNodes = [];

        node.visibility = targetStatus;
        setNodeVisibility(node, targetStatus);

        getAllChildNodes(node, node.itemId, childNodes);
        _.each(childNodes, function (childNode) {
          childNode.visibility = targetStatus;
          setNodeVisibility(childNode, targetStatus);
        });
      };

      var getParentNodes = function (node, result) {
        var parentId = node.parentId;
        if (parentId) {
          var parentItem = getLayerByItemId(parentId, overlayItems);
          if (parentItem) {
            result.push(parentItem);
            getParentNodes(parentItem, result);
          }
        }
      };

      var getAllChildNodes = function (node, parentId, result) {
        if (node.itemId !== parentId) {
          result.push(node);
        }

        if (node.isGroup) {
          _.each(node.layers, function (childNode) {
            getAllChildNodes(childNode, parentId, result);
          });
        }
      };

      var setParentNodesVisibility = function (nodeId) {
        var node = getLayerByItemId(nodeId, overlayItems);
        if (!node) {
          return;
        }

        var parentNodes = [];
        getParentNodes(node, parentNodes);
        _.each(parentNodes, function (parentNode) {
          if (parentNode.itemId === node.itemId) {
            return;
          }

          var childNodes = [], enabled = false;
          getAllChildNodes(parentNode, parentNode.itemId, childNodes);
          _.each(childNodes, function (childNode) {
            if (childNode.visibility) {
              enabled = true;
            }
          });

          parentNode.visibility = enabled;
        });
      };

      var setNodeVisibility = function (item, targetStatus) {
        var layerId = item.id;
        if (layerId) {
          if (layerId === gtrafficId) {
            setGoogleTrafficVisible(targetStatus);
            $.publish('overlayVisibilityChanged', [layerId, targetStatus]);
          } else {
            var layerFromLookup = overlayIdToLayerLookup[item.itemId];
            layerFromLookup.setVisible(targetStatus);
            $.publish('overlayVisibilityChanged', [layerId, targetStatus]);
            return false;
          }
        }
      };

      var setGoogleTrafficVisible = function setGoogleTrafficVisible(visible) {
        if (visible) {
          gtraffic.setMap(gmap);
        } else {
          gtraffic.setMap(null);
        }
      };

      var processLayerTree = function (layerNodes, result) {
        _.each(layerNodes, function (layer) {
          if (layer.isGroup && layer.layers) {
            var layerGroup = $.extend(true, {}, layer);
            layerGroup['layers'] = [];
            processLayerTree(layer.layers, layerGroup.layers);
            result.push(layerGroup);
          } else {
            var overlayItem,
              name,
              id,
              visible;

            if (layer.get('isGoogleTraffic')) {
              id = gtrafficId;
              if (layer.getMap()) {
                visible = true;
              } else {
                visible = false;
              }
              visible = layer.getMap();
              name = layer.get('name');
            } else {
              name = MapHelper.getLayerName(layer);
              id = MapHelper.getLayerId(layer);
              visible = MapHelper.getVisibility(layer);
            }

            overlayItem = {
              visibility: visible,
              overlay: layer,
              isGroup: false,
              itemId: layer.itemId,
              parentId: layer.parentId,
              groupId: layer.groupId
            };
            if (name) {
              overlayItem['id'] = id;
              overlayItem['name'] = name;
            } else {
              overlayItem['id'] = 'unknown';
              overlayItem['name'] = 'unknown';
            }
            result.push(overlayItem);
          }
        });
      };

      var setupInitialVisibility = function (items) {
        _.each(items, function (item) {
          if (item.isGroup && item.layers) {
            setupInitialVisibility(item.layers);
          } else {
            setParentNodesVisibility(item.itemId);
          }
        });
      };

      var addLayers = function addLayers(layers, $overlayList) {
        reset();
        processLayerTree(layers, overlayItems);
        setupInitialVisibility(overlayItems);
        createOverlayItems($overlayList, overlayItems);
      };

      var reset = function reset() {
        overlayItems = [];
      };

      var getOverlayItems = function() {
        return overlayItems;
      };

      return {
        addLayers: addLayers,
        reset: reset,
        __TEST_ONLY__: {
          getOverlayItems: getOverlayItems,
          setNodeVisibility: setNodeVisibility
        }
      };
    })(); //end of overlayManager definition

    var getLayersByType = function getLayersByType(olMapRef) {
      var baseLayers = [],
        overlayLayers = [],
        layers = olMapRef.getLayers().getArray();
      if (gtraffic) overlayLayers.push(gtraffic);
      _.each(layers, function (layer) {
        if (MapHelper.isBaseLayer(layer)) {
          baseLayers.push(layer);
        } else {
          overlayLayers.push(layer);
        }
      });
      return {
        baseLayers: baseLayers,
        overlayLayers: overlayLayers
      };
    };



    var eventSubscribe = function eventSubscribe() {
      $.subscribe('mapInitialised', function (mapName, olMap, googleMap, GoogleTrafficLayer) {
        gmap = googleMap;
        gtraffic = GoogleTrafficLayer;
        init(mapName, olMap, googleMap);
      });
    };

    var init = function init(mapName, olMap) {
      var $mapContainer = $('div.map[data-map-name="' + mapName + '"]');

      if ($mapContainer) {
        var layersSortedByType = getLayersByType(olMap),
          baseLayers = layersSortedByType.baseLayers,
          overlayLayers = layersSortedByType.overlayLayers,
          $overlayContainer,
          $overlayList;

        //If there are more than 1 available base layers add the chooser
        if (baseLayers.length > 1) {
          buildBaseLayerChooser($mapContainer, baseLayers, olMap);
        }

        $overlayContainer = $('button[data-layer-map="' + mapName + '"]').parent();
        $overlayList = $overlayContainer;

        if ($overlayList.length > 0) {
          if (overlayLayers.length > 0) {
            buildOverlayChooser($overlayList, overlayLayers, olMap);
          }

          $.subscribe('layerAdded', function (targetolMap) {
            if (targetolMap.id === olMap.id) {
              rebuildOverlayChooser($overlayList, olMap);
            }
          });
        }
      }
    };

    var buildBaseLayerChooser = function buildBaseLayerChooser($mapContainer, baseLayers, olMap) {
      //Create main element container
      var processedLayers;
      baseLayerManager.addLayers(baseLayers);
      processedLayers = baseLayerManager.getLayers();
      $mapContainer.append(templateBaseContainer.render({
        twoLayers: processedLayers.length === 2,
        layers: processedLayers
      }));

      $('.base-layer-chooser li', $mapContainer).click({
        map: olMap
      }, function (event) {
        var layerItem = $(event.target),
          layerId = layerItem.data('layer-id'),
          olMapRef = event.data.map,
          layers = olMapRef.getLayers().getArray(),
          layer;

        layers.forEach(function (element) {
          if (MapHelper.getLayerId(element) === layerId) {
            element.setVisible(true);
            layer = element;
          } else {
            if (MapHelper.isBaseLayer(element)) {
              element.setVisible(false);
            }
          }
        });
        $.publish('baseLayerChanged', [layer, olMapRef]);

        //Change selected item
        layerItem.parent().children('li').removeClass('selected');
        layerItem.addClass('selected');
      });
    };

    var getMaxLayerId = function(array) {
      if (array.length && array.length > 0) {
        return Math.max.apply(Math, array.map(function(o) {
          return o.idNumber || 0;
        }));
      }
      return 0;
    };

    var sortOverlays = function sortOverlays(overlayLayers) {
      overlayIdToLayerLookup = {};

      var findOverlay = function findOverlay(overlayName, sourceNames) {
        sourceNames = sourceNames || {};
        var foundLayer;
        $.each(overlayLayers, function () {
          if ((overlayName === gtrafficString) && (gtraffic)) {
            foundLayer = gtraffic;
            return false;
          }
          if (!this.get('isGoogleTraffic')) {
            var externalLayerName = MapHelper.getLayerName(this);
            var layerSourceName = this.get('ServerLayerName');
            if (sourceNames[externalLayerName]) {
              if (sourceNames[externalLayerName] === layerSourceName) {
                foundLayer = this;
                  return false;
              }
            } else if (externalLayerName === overlayName) {
              foundLayer = this;
              return false;
            }
          }
        });

        if (foundLayer) {
          overlayLayers = _.without(overlayLayers, foundLayer);
        }
        return foundLayer;
      };

      var createGroup = function createGroup(layerGroupName, id, parentId, visibility) {
        return {
          name: layerGroupName,
          itemId: 'i' + id,
          idNumber: id,
          parentId: parentId ? 'i' + parentId : null,
          groupId: 'g' + id,
          layers: [],
          isGroup: true,
          visibility: visibility
        }
      };

      var buildLayerTree = function buildLayerTree(layerDefs, result, parentId, startId, sourceNames) {
        $.each(layerDefs, function (layerDefIndex, layerDef) {
            var id = ((parentId ? parentId + '.' + layerDefIndex : layerDefIndex) + startId).toString();
            if (typeof this === 'object') {
              var layerGroupName = layerDef.LayerGroupName;
              var layerGroupLayers = layerDef.Layers;
              if (layerGroupName && layerGroupLayers) {
                var layerGroup = createGroup(layerGroupName, id, parentId, false);
                buildLayerTree(layerGroupLayers, layerGroup.layers, id, "");
                result.push(layerGroup);
              }
            } else {
              var internalLayerName = MapHelper.wmtsLayerInternalNameForExternalName(layerDef)
              var authGroups = MapHelper.authGroups(internalLayerName);
              if (!authGroups) {
                var layer = findOverlay(layerDef, sourceNames);
                if (layer) {
                  layer.itemId = 'i' + id;
                  layer.idNumber = id;
                  layer.parentId = parentId ? 'i' + parentId : null;
                  layer.groupId = null;
                  layer.isGroup = false;
                  result.push(layer);
                  overlayIdToLayerLookup[layer.itemId] = layer;
                }
              } else {
                var authLayerGroup = createGroup(layerDef, id, parentId, true);
                var layerAuthNames = [];
                var groupSourceNames = {};
                _.each(authGroups, function (authGroup) {
                  layerAuthNames.push(authGroup.name);
                  var internalLayerDef = MapHelper.wmtsLayerInternalNameForExternalName(layerDef)
                  groupSourceNames[authGroup.name] = internalLayerDef + '!auth!' + authGroup.scope;
                });
                buildLayerTree(layerAuthNames, authLayerGroup.layers, id, "", groupSourceNames);
                result.push(authLayerGroup);
              }
            }
          });
        };

        var layerOrderDefs = Config.LayerOrder,
          layerTree = [];

        if (!layerOrderDefs) {
          layerOrderDefs = [];
          $.each(Config.Layers, function (groupIndex, layerGroup) {
            $.each(layerGroup, function (layerIndex, layer) {
              layerOrderDefs.push(layer.ExternalLayerName);
            });
          });
          var startId = getMaxLayerId(layerTree) + 1;
          buildLayerTree(layerOrderDefs, layerTree, null, startId);
        } else {
          buildLayerTree(layerOrderDefs, layerTree, null, "");
          var startId = getMaxLayerId(layerTree) + 1;
          $.each(overlayLayers, function (overlayIndex, overlay) {
            overlay.itemId = 'i' + (startId + overlayIndex);
            layerTree.unshift(overlay);
          });
        }

        return layerTree;
    };

    var rebuildOverlayChooser = function rebuildOverlayChooser($overlayList, olMapRef) {
      //   sortedOverlayLayers;
      var layersSortedByType = getLayersByType(olMapRef),
        overlayLayers = layersSortedByType.overlayLayers,
        sortedOverlayLayers;

      $overlayList.remove('ul');
      overlayManager.reset();

      sortedOverlayLayers = sortOverlays(overlayLayers);
      overlayManager.addLayers(sortedOverlayLayers, $overlayList, olMapRef);
    };

    var buildOverlayChooser = function buildOverlayChooser($overlayList, overlayLayers, olMap) {
      var sortedOverlayLayers = sortOverlays(overlayLayers);

      overlayManager.addLayers(sortedOverlayLayers, $overlayList, olMap);

      $overlayList = $('ul.dropdown-menu', $overlayList);

      //Prevent Overlay Chooser from closing on click
      $overlayList.click(function (event) {
        event.stopPropagation();
      });

      $overlayList.mouseleave(function (event) {
        currentMouseAction = null;
        mouseDown = false;
      });

      //Measure menu width when opned and make sized fix to prevent jitter when
      //text toggles between bold and normal
      var $toggleButton = $overlayList.parent().children('.dropdown-toggle');
      $toggleButton.click(function (event) {
        var $menu = $(this).parent().children('.dropdown-menu');
        $menu.css('width', '');
        var currentWidth = $menu.width() + 'px';
        $menu.css('width', currentWidth);
      });
    };

    eventSubscribe();

    var api = {
      __TEST_ONLY__: {
        init: init,
        overlayManager: overlayManager,
        config: Config,
        getLayersByType: getLayersByType,
        getMaxLayerId: getMaxLayerId,
        sortOverlays: sortOverlays
      }
    };

    return api;
  }); // End of LayerList definition
