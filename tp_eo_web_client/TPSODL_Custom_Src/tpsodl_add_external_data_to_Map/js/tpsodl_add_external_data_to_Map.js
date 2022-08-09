/*! ElectricOfficeWeb 5.0.1 2019-12-09 */
define(["jquery", "underscore", "i18n!nls/messages", "hogan", 'map-loader', 'map-helper', 'map-google', "OpenLayers3", "proj4"],


    function($, _, messages, hogan, mapdsConfig, mapHelper, google, OpenLayers3, proj4) {
        "use strict";
        var mapRef,
            mapName,
            n,
            o,
            p = !1,
            q = !1,

            init = function() {
                initialise();
            },
            mapInit = function() {
                $("#tpsodl_add_external_data_to_map").css('display', 'inline')
                $.subscribe("mapInitialised", map)
            },
            map = function(a, b) {
                mapRef = b,
                    mapName = a,
                    init()
            };
        mapInit();
        var info1 = $('#info1');
        info1.tooltip({
            animation: false,
            trigger: 'manual'
        });
        var raiseValidationError = function raiseValidationError(errMessage) {

            $.publish("raiseTempMessage", [errMessage, {
                messageType: "error"
            }]);
        };
        var raiseSuccessMessage = function raiseSuccessMessage(succMessage) {

            $.publish("raiseTempMessage", [succMessage, {
                messageType: "success"
            }]);
        };
        var raiseWarningMessage = function raiseWarningMessage(WarnMessage) {

            $.publish("raiseTempMessage", [WarnMessage, {
                messageType: "warning"
            }]);
        };

        var initialise = function() {
            var flag = false;
            var vectorSource1;
            var vectorSource2;
            var vectorSource = [];
            var source = [];
            var dragAndDropInteraction;

            $("#tpsodl_add_external_data_to_map").click(function() {

                dragAndDropInteraction = new OpenLayers3.interaction.DragAndDrop({
                    formatConstructors: [
                        OpenLayers3.format.GPX,
                        OpenLayers3.format.GeoJSON,
                        OpenLayers3.format.IGC,
                        OpenLayers3.format.KML,
                        // new OpenLayers3.format.KML({extractStyles: true}),
                        // KMZ,
                        // OpenLayers3.format.KMZ,
                        OpenLayers3.format.TopoJSON
                    ]
                });

                if (flag) {
                    flag = false;
                    // $("#map-drag-drop-custom-tools").css("background-color" ,"#62a03c");
                    $("#tpsodl_add_external_data_to_map_button").css("background-color", "#ffffff");
                    $("#tpsodl_add_external_data_div").css("display", "none");
                    mapRef.getInteractions().forEach(function(interaction) {
                        if (interaction instanceof OpenLayers3.interaction.DragAndDrop) {
                            mapRef.removeInteraction(interaction);
                        }
                    }, this);

                    vectorSource.forEach(function(layer, i) {
                        layer.clear();
                    });
                } else {
                    flag = true;
                    $("#tpsodl_add_external_data_result").empty();
                    source = [];
                    mapRef.addInteraction(dragAndDropInteraction);
                    // $("#map-drag-drop-custom-tools").css("background-color", "#e48313");
                    $("#tpsodl_add_external_data_to_map_button").css("background-color", "darkgray");
                    raiseSuccessMessage("Please Drag and Drop required files.");
                }

                var defaultStyle = {
                    'Point': [new OpenLayers3.style.Style({
                        image: new OpenLayers3.style.Icon(({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 1,
                            src: './TPSODL_Custom_Src/img/tpsodl_custom_pin.png'
                        }))
                    })],
                    'LineString': [new OpenLayers3.style.Style({
                        stroke: new OpenLayers3.style.Stroke({
                            cOpenLayers3or: '#ffa500', //'#f00',
                            color: '#ffa500', //'#f00',
                            width: 3
                        })
                    })],
                    // 'POpenLayers3ygon': [new OpenLayers3.style.Style({
                    // fill: new OpenLayers3.style.Fill({
                    // cOpenLayers3or: 'rgba(0,255,255,0.5)'
                    // }),
                    // stroke: new OpenLayers3.style.Stroke({
                    // cOpenLayers3or: '#0ff',
                    // width: 1
                    // })
                    // })],
                    'Polygon': [new OpenLayers3.style.Style({
                        // fill: new OpenLayers3.style.Fill({
                        // cOpenLayers3or: '#ffa500',//'Orange',//'rgba(0,255,255,0.5)'
                        // color: '#ffa500',//'Orange',//'rgba(0,255,255,0.5)'
                        // }),
                        stroke: new OpenLayers3.style.Stroke({
                            cOpenLayers3or: '#FF1493', //'#00f',
                            color: '#FF1493', //'#00f',
                            width: 2
                        })
                    })],
                    'MultiPoint': [new OpenLayers3.style.Style({
                        image: new OpenLayers3.style.Icon(({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            opacity: 1,
                            src: './TPSODL_Custom_Src/img/tpsodl_custom_pin.png'
                        }))
                    })],
                    'MultiLineString': [new OpenLayers3.style.Style({
                        stroke: new OpenLayers3.style.Stroke({
                            cOpenLayers3or: '#ffa500', //'#0f0',
                            color: '#ffa500', //'#0f0',
                            width: 3
                        })
                    })],
                    'MultiPolygon': [new OpenLayers3.style.Style({
                        // fill: new OpenLayers3.style.Fill({
                        // cOpenLayers3or: '#ffa500',//'Orange',//'rgba(0,255,255,0.5)'
                        // color: '#ffa500',//'Orange',//'rgba(0,255,255,0.5)'
                        // }),
                        stroke: new OpenLayers3.style.Stroke({
                            cOpenLayers3or: '#FF1493', //'#00f',
                            color: '#FF1493', //'#00f',
                            width: 1
                        })
                    })] //,
                    // 'MultiPOpenLayers3ygon': [new OpenLayers3.style.Style({
                    // fill: new OpenLayers3.style.Fill({
                    // cOpenLayers3or: 'rgba(0,0,255,0.5)'
                    // }),
                    // stroke: new OpenLayers3.style.Stroke({
                    // cOpenLayers3or: '#00f',
                    // width: 1
                    // })
                    // })]
                };

                var styleFunction = function(feature, resOpenLayers3ution) {
                    var featureStyleFunction = feature.getStyleFunction();
                    if (featureStyleFunction) {
                        return featureStyleFunction.call(feature, resOpenLayers3ution);
                    } else {
                        return defaultStyle[feature.getGeometry().getType()];
                    }
                };

                dragAndDropInteraction.on('addfeatures', function(event) {
                    $("#tpsodl_add_external_data_div").css("display", "block");
                    $("#tpsodl_add_external_data_result").append("<lable>" + event.file.name + "</lable></br>");
                    source.push(event.file.name);
                    vectorSource[source.length - 1] = new OpenLayers3.source.Vector({
                        features: event.features,
                        projection: event.projection,
                    });
                    vectorSource[source.length - 1].set('name', event.file.name);
                    mapRef.getLayers().push(new OpenLayers3.layer.Image({
                        source: new OpenLayers3.source.ImageVector({
                            source: vectorSource[source.length - 1],
                            style: styleFunction
                        })
                    }));
                    var view = mapRef.getView();
                    view.fit(
                        vectorSource[source.length - 1].getExtent(), /** @type {OpenLayers3.Size} */ (mapRef.getSize()));
                });

                var displayFeatureInfo = function(pixel) {
                    var features = [];
                    mapRef.forEachFeatureAtPixel(pixel, function(feature, layer) {
                        features.push(feature);
                    });

                    if (features.length > 0) {

                        var info = [];
                        var i, ii;
                        for (i = 0, ii = features.length; i < ii; ++i) {
                            var tip_content = ""
                            if (features[i].get('name') != undefined) {
                                tip_content = features[i].get('name');
                            } else if (features[i].T != undefined) {
                                _.each(features[i].T, function(v, k) {
                                    if (typeof(v) == 'string') {
                                        tip_content += k + " : " + v + "\r\n"
                                    };
                                })
                            }

                            info1.tooltip('hide')
                            info1.attr('data-original-title', tip_content)
                            info1.tooltip('fixTitle')
                            var data_info = $("#data_info");
                            data_info.css({
                                left: pixel[0] + 'px',
                                top: (pixel[1] - 15) + 'px',
                                position: "relative"
                            });

                            info1.tooltip('show');
                        }
                    } else {}
                };

                mapRef.on('pointermove', function(evt) {

                    info1.tooltip('hide');

                    if (evt.dragging) {
                        info1.tooltip('hide');
                        return;
                    }
                    displayFeatureInfo(mapRef.getEventPixel(evt.originalEvent));
                });
                mapRef.on('click', function(evt) {
                    displayFeatureInfo(evt.pixel);
                });
                mapRef.on('dblclick', function() {
                    vector.getSource().clear(true);

                });

                $(mapRef.getViewport()).on('mousemove', function(evt) {
                    var pixel = mapRef.getEventPixel(evt.originalEvent);
                    displayFeatureInfo(pixel);
                });

                mapRef.on('click', function(evt) {
                    displayFeatureInfo(evt.pixel);
                });


            });
        }

    });