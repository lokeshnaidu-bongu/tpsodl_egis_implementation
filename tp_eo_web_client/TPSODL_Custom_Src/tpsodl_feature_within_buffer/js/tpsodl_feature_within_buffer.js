/**
 * Configurable Sidebar component for displaying feature-within-buffer panel.
 * @module Feature-witin-Buffer
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
        'jquery',
        'underscore',
        'i18n!custom/nls/messages',
        'map-loader',
        "results-list",
        'OpenLayers3',
        'text!tpsodl_feature_within_buffer_partials/tpsodl_feature_within_buffer.html',
        'hogan',
        'comms',
        'map-core-component/pubsub',
        "map-helper",
        'spinner'
    ],
    function FeaturewitinBuffer($, _, Messages, MapLoader, ResultsList, ol, template, hogan, CommsLayer) {
        'use strict';
        var mapref, mapname = "main_map",
            buffer_selected_criteria, buffer_options = true;
        var selectedColl;
        var distValue;
        var tpsodl_feature_values;
        var coord, open_lay, vector, draw, geom;
        var $spinner, resultsList, $resultsSelector, trace_layer, trail_placed=false;
		var trail_circle, trail_coord, sides= 400;
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 49],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: 'TPSODL_Custom_Src/img/startnode.png'
            }))
        });
        var styles = [
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        ];
        var l_stroke = {
            strokeWidth: 5,
            strokeColor: "rgba(255, 0, 0, 0.75)"
        };
        var D = new ol.style.Stroke({
                color: l_stroke.strokeColor,
                width: l_stroke.strokeWidth
            }),
            E = new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: [0, 0, 255, 1]
                }),
                stroke: D
            }),
            F = new ol.style.Style({
                stroke: D,
                image: E
            });
        var overlay = hogan.compile(template);
        var cardTemplate = hogan.compile(template),
            sidebarControlName = 'tpsodl_feature_within_buffer',
            $cardSelector;
        var selectedMenuSidebarCtrlBtn;

        /**
         * @memberof module:FeaturewitinBuffer
         * @private
         * @listens ViewerEvents.leavingSidebar
         * @listens ViewerEvents.gotoSidebar
         * @listens ViewerEvents.mapInitialised
         * @listens ViewerEvents.sidebarContainerReady
         * @listens ViewerEvents.exportRequested
         */
        var eventSubscribe = function eventSubscribe() {
            $.subscribe('sidebarContainerReady', function(targetName, $targetSelector) {
                if (targetName === sidebarControlName) {
                    initialise($targetSelector, {
                        id: targetName
                    });
                }
            });

            $.subscribe('leavingSidebar', function(target) {
                //what should be done on leaving feature-within-buffer sidebar
                if (target === sidebarControlName) {
                    // if (resultsList) {
                        // resultsList.clear();
                    // }
                    // mapref.removeInteraction(draw);
                    // mapref.removeLayer(vector);
                    // coord = ""
                    // if (selectedMenuSidebarCtrlBtn)
                        // selectedMenuSidebarCtrlBtn.removeClass("tpsodl-menu-btn-selected");
                    // $("#FeatureDetails").html("")
                }
            });

            $.subscribe('gotoSidebar', function(target) {
                // what should be done on entering feature-within-buffer sidebar
                if (target === sidebarControlName) {

                    if (tpsodl_feature_values != undefined) {
                        var tra_urns=[]
                        $.each(tpsodl_feature_values.features, function(k, v) {
                            tra_urns.push(v.id)

                        })

                        if (tpsodl_feature_values.geographic_context != undefined) {


                            resultsList.renderResults(tpsodl_feature_values.features, {
                                geographic_context: tpsodl_feature_values.geographic_context,
                                resultType: $('.module-body select#queryType', $cardSelector).val(),
                                showMarkers: true,
                                showNumberBadges: true,
                                export: {
                                    title: "Export Details",
                                    fileName: "export_data."
                                }
                            })
                        } else {
                            resultsList.renderResults(tpsodl_feature_values.features, {
                                showMarkers: true,
                                showNumberBadges: true,
                                export: {
                                    title: "Export Details",
                                    fileName: "export_data."
                                }
                            })
                        }
                    }

                    if (buffer_selected_criteria == "Point") {
                        mapref.addInteraction(draw)

                    } else if (buffer_selected_criteria == undefined || buffer_selected_criteria == "Selection" || buffer_selected_criteria == "Point" || buffer_selected_criteria == "Polygon") {
                        $('#bpnumberDiv').hide();
                        $('#polenumberDiv').hide();

                        $('#tpsodl_to_get_near_consumers').hide();
                    } else if (buffer_selected_criteria == "pole_number") {
                        $('#polenumberDiv').show();

                    } else {
                        $('#tpsodl_to_get_near_consumers').show();
                        $('#bpnumberDiv').show();

                    }

                }
            });

            $.subscribe('mapInitialised', function(mapNameRef, olMapRef) {

                // what should happen when map is initialized
				$("#specialQueryDiv").hide();
                mapref = olMapRef, mapname = mapNameRef
                $spinner = $($cardSelector).find('#fwb_spinner');
                $resultsSelector = $('#FeatureDetails', $cardSelector);
                resultsList = ResultsList.getNewResultsList({
                    selector: $resultsSelector,
                    paging: true,
                    map: {
                        olMap: mapref,
                        mapName: mapname
                    },
                    parentComponent: sidebarControlName,
                    export: true,
                    filter: true
                });
            });


            $.subscribe("popoverButtonVisibilityControl", function(b, c, e) {
                // Parameter b is used as trace button, c is urn and e is object contains type and coordinates
                req_urns = c


            });

        };

        eventSubscribe();
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


        var initialise = function initialise(selector) {
            $cardSelector = selector;
            // get_FeaturesInfo();
            buildUI();

        };

        var spinOn = function spinOn() {
            if ($spinner) {
                $spinner.spin();
            }
        };

        var spinOff = function spinOff() {
            if ($spinner) {
                $spinner.spin(false);
            }
        };


        var openSidebarFromMenuItemBtn = function() {
            selectedMenuSidebarCtrlBtn.addClass("tpsodl-menu-btn-selected");
            $.publish("openSidebarToItem", [sidebarControlName]);
        };

        var buildUI = function buildUI() {
            $('#FeatureDetails').hide();
            $('#specialQueryDiv').hide();
            var options = {
                messages: Messages,
            };
            $cardSelector.append(cardTemplate.render(options));
            $("#menu_" + sidebarControlName).click(function() {
                if (!$(this).hasClass("tpsodl-menu-btn-selected")) {
                    selectedMenuSidebarCtrlBtn = $(this);
                    openSidebarFromMenuItemBtn()
                }
            });

            $("#fwb_criteria").change(function() {
                $("#submitFeatureData").html("Submit");
                $("#fwb_dataset").val("default");
                $('#tpsodl_to_get_near_consumers').hide();
				trail_placed = false;
				
                buffer_selected_criteria = $(this).children("option:selected").val();
                if (buffer_selected_criteria == "Selection") {
                    $('#datasetTypeDiv').show();
                    $('#bufferDistance').show();
                    $('#featureTypeDiv').show();
                    $("#specialQueryDiv").hide();
                    $('#bpnumberDiv').hide();
                    $('#polenumberDiv').hide();
                    clearData()
                } else if (buffer_selected_criteria == "Point") {
                    clearData()

                    $('#datasetTypeDiv').show();
                    $('#bufferDistance').show();
                    $('#featureTypeDiv').show();
                    $("#specialQueryDiv").hide();
                    $('#bpnumberDiv').hide();
                    $('#polenumberDiv').hide();
                    open_lay = "", vector = ""
                    open_lay = new ol.source.Vector({});

                    draw = new ol.interaction.Draw({
                        source: open_lay,
                        type: "Point"
                    });
                    mapref.addInteraction(draw);
                    draw.on('drawend', function(event) {
                        geom = event.feature.getGeometry().getCoordinates()

                        coord = geom
						trail_coord = coord;
                        var thing = new ol.geom.Point([geom[0], geom[1]]);

                        var featurething = new ol.Feature({
                            name: "Thing",
                            geometry: thing,
                            style: new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: 'red'
                                })
                            })
                        });

                        var source = new ol.source.Vector({
                            features: [featurething],
                            wrapX: false
                        });
                        vector = new ol.layer.Vector({
                            source: source,
                            style: styles
                        })
                        mapref.addLayer(vector);
						trail_placed = true;
						
						draw_buffer();

                        mapref.removeInteraction(draw);
                    });


                } else if (buffer_selected_criteria == "Polygon") {

                    $('#bufferDistance').hide();
                    $('#featureTypeDiv').show();
                    $('#datasetTypeDiv').show();

					$("#specialQueryDiv").hide
                    $('#bpnumberDiv').hide();
                    $('#polenumberDiv').hide();
                    clearData()

                } else if (buffer_selected_criteria == "bp_number") {

                    $('#bufferDistance').show()
                    $('#datasetTypeDiv').hide();
                    $("#specialQueryDiv").hide();
                    $('#featureTypeDiv').hide();
                    $('#bpnumberDiv').show();
                    $('#polenumberDiv').hide();
                    $("#submitFeatureData").html("Get DT's");
                    $('#tpsodl_to_get_near_consumers').show();
                    clearData()

                } else if (buffer_selected_criteria == "pole") {

                    $('#bufferDistance').show();
                    $('#featureTypeDiv').hide();
                    $("#specialQueryDiv").hide();
                    $('#datasetTypeDiv').hide();
                    $('#bpnumberDiv').hide();
                    $("#submitFeatureData").html("Get DT's");
                    $('#polenumberDiv').show();
                    clearData()


                }



            });
			
			// if user changes the dataset name, respective features must be loaded to the features list
			$("#fwb_dataset").change(function() {
				// Call service to refresh the collections
				if ($(this).children("option:selected").val() == 'default'){
					cleardata();
					$("#specialQueryDiv").hide();
					return;
				}
				
				if($(this).children("option:selected").val() == 'special_query'){
					// clearData();
					$("#specialQueryDiv").show();
					$('#featureTypeDiv').hide();
					$('#bpnumberDiv').hide();
					$('#polenumberDiv').hide();
					return;
				}
				
				$('#featureTypeDiv').show();
				$("#specialQueryDiv").hide();
				
				get_FeaturesInfo();
			});
			
            $("#bufferDistance").bind('keypress keyup keydown', function(e) {
                if (e.key == '-' || e.key == '.') {
                    return false;
                }
            });
			
			$("#bufferDistance").keyup(function(){
				console.log(">> keydown = ",$("#distance_in_meters").value);
				if (trail_placed){
					draw_buffer();
				}
			});
			// $("#bufferDistance").change(function(){
				// console.log("Buffer distance changed = ",$("#distance_in_meters").value);
				
				// if (trail_placed){
					// draw_buffer();
				// }
			// });
			
			

            $("#submitFeatureData").click(function() {
                buffer_options = false;
                tpsodl_feature_values = undefined;
                distValue = document.getElementById('distance_in_meters');
				// trail_circle && (mapref.removeLayer(trail_circle), trail_circle = void 0);

                $.publish("clearPopovers");
                if (resultsList) {
                    resultsList.clear();
                }
                // if (buffer_selected_criteria == "bp_number") {
                    // if ($('#bp_number').val() == "" || $('#bp_number').val() == undefined) {
                        // raiseWarningMessage("Provide conusmer BP Number");
                    // } else if (distValue.value == 0) {
                        // raiseWarningMessage(Messages.tpsodl_feature_within_buffer.bufferAlert);
                    // } else if (distValue.value >= 10000) {
						// raiseWarningMessage(Messages.tpsodl_feature_within_buffer.largeBuffer);

					// }else {


                        // var bp_options = {
                            // json: false,
                            // method: 'getDtsAroundConsumer',
                            // bp_number: $("#bp_number").val(),
                            // buffer_radius: distValue.value
                        // }
                        // spinOn();
                        // disableButtons()
                        // CommsLayer.getGSSRequest(bp_options, selection_Succes, Selection_Error);
                    // }

                // } else if (buffer_selected_criteria == "pole") {
                    // if ($('#pole_number').val() == "" || $('#pole_number').val() == undefined) {
                        // raiseWarningMessage("Provide Pole Number");
                    // } else if (distValue.value == 0) {
                        // raiseWarningMessage(Messages.tpsodl_feature_within_buffer.bufferAlert);

                    // } else if (distValue.value >= 10000) {
						// raiseWarningMessage(Messages.tpsodl_feature_within_buffer.largeBuffer);

					// } else {


                        // var pole_options = {
                            // json: false,
                            // method: 'getDtsAroundPole',
                            // pole_number: $("#pole_number").val(),
                            // buffer_radius: distValue.value
                        // }
                        // spinOn();
                        // disableButtons()
                        // CommsLayer.getGSSRequest(pole_options, selection_Succes, Selection_Error);
                    // }

                // } else {
                    if (buffer_selected_criteria == undefined) {
                        buffer_selected_criteria = "Selection"
                    }
                    if (req_urns == undefined && buffer_selected_criteria != "Point") {
                        raiseWarningMessage(Messages.tpsodl_feature_within_buffer.objectAlert);
                        buffer_options = false;

                    } else if ($('#fwb_dataset').val() == undefined || $('#fwb_dataset').val() == "default") {
                        raiseWarningMessage(Messages.tpsodl_feature_within_buffer.datasetAlert);
                        buffer_options = false;

                    } else if ($('#fwb_dataset').val() == "special_query" && ($('#fwb_specialquery').val() == undefined || $('#fwb_specialquery').val() == "default")) {
                        raiseWarningMessage(Messages.tpsodl_feature_within_buffer.selectQueryAlert);
                        buffer_options = false;

                    } else if ($('#fwb_dataset').val() != "special_query" && (selectedColl == undefined || selectedColl == "default")){
                        raiseWarningMessage(Messages.tpsodl_feature_within_buffer.featureAlert);
                        buffer_options = false;

                    } else if (buffer_selected_criteria == "Polygon") {
                        distValue = {
                            value: -1
                        };
                        buffer_options = true;
                    } else if (buffer_selected_criteria == "Selection") {

                        if (distValue.value == 0) {
                            raiseWarningMessage(Messages.tpsodl_feature_within_buffer.bufferAlert);

                        } else if (distValue.value >= 10000) {
							raiseWarningMessage(Messages.tpsodl_feature_within_buffer.largeBuffer);

						}else {
                            buffer_options = true;
                        }
                    } else if (buffer_selected_criteria == "Point") {

                        if (distValue.value == 0) {
                            raiseWarningMessage(Messages.tpsodl_feature_within_buffer.bufferAlert);
                        } else if (distValue.value >= 10000) {
							raiseWarningMessage(Messages.tpsodl_feature_within_buffer.largeBuffer);

						}else {
							var temp_coord = [];
							temp_coord[0] = coord[0]*1000;
							temp_coord[1] = coord[1]*1000;
							
							console.log($('#fwb_specialquery').val());

							var missing_bp = ($('#fwb_dataset').val() == "special_query") ?  (($('#fwb_specialquery').val() == undefined || $('#fwb_specialquery').val() == "default") ? false : true) : false;
							
                            if (coord != "" && coord != undefined) {
                                var trail_values = {}
                                trail_values["latlng"] = temp_coord
								
                                var selectionFuture_options = {
                                    json: false,
                                    method: 'getTrailPointInfo',
                                    name: buffer_selected_criteria,
                                    trail_coordinates: JSON.stringify(temp_coord),
                                    collection: selectedColl,
									missing_bp : missing_bp,
                                    buffer_radius: distValue.value
                                }
                                spinOn();
                                disableButtons()
                                CommsLayer.getGSSRequest(selectionFuture_options, selection_Succes, Selection_Error);
                            } else {
                                raiseWarningMessage(Messages.tpsodl_feature_within_buffer.trailAlert);

                            }
                        }
                    }

                    if (buffer_options) {
						console.log($('#fwb_specialquery').val());
						var missing_bp = ($('#fwb_dataset').val() == "special_query") ?  (($('#fwb_specialquery').val() == undefined || $('#fwb_specialquery').val() == "default") ? false : true) : false;
                        var selectionFuture_options = {
                            json: false,
							method:"getSelectionFutureInfo",
                            name: buffer_selected_criteria,
                            urns_list: req_urns,
                            collection: selectedColl,
							missing_bp : missing_bp,
                            buffer_radius: distValue.value
                        }
                        spinOn();
                        disableButtons()
                        // CommsLayer.postGSSRequest(selectionFuture_options, "?method=getSelectionFutureInfo", selection_Succes, Selection_Error)
                        CommsLayer.getGSSRequest(selectionFuture_options, selection_Succes, Selection_Error);
                    }
                // }

            });



            $("#tpsodl_to_get_near_consumers").click(function() {
                console.log($('#bp_number').val())
                distValue = document.getElementById('distance_in_meters');
                if ($('#bp_number').val() == "" || $('#bp_number').val() == undefined) {
                    raiseWarningMessage("Provide Consumer BP Number");
                } else if (distValue.value == 0) {
                    raiseWarningMessage(Messages.tpsodl_feature_within_buffer.bufferAlert);

                } else if (distValue.value >= 10000) {
                    raiseWarningMessage(Messages.tpsodl_feature_within_buffer.largeBuffer);

                }else {

                    var bp_options = {
                        json: false,
                        method: 'getNeighbouringConsumers',
                        bp_number: $("#bp_number").val(),
                        buffer_radius: $("#distance_in_meters").val()
                    }
                    spinOn();
                    disableButtons()
                    CommsLayer.getGSSRequest(bp_options, selection_Succes, Selection_Error);
                }

            });
            $("#tpsodl_fwb_clear").click(function() {

                buffer_selected_criteria = "Selection";
                $('#fwb_criteria option[value="Selection"]').prop('selected', 'selected');
                $('#fwb_specialquery option[value="default"]').prop('selected', 'selected');
                $('#fwb_dataset option[value="default"]').prop('selected', 'selected');
                $('#bp_number').val("")
                $('#pole_number').val("")
                $('#bufferDistance').show();
                $('#featureTypeDiv').show();
                $("#specialQueryDiv").hide();
                $('#fwb_dataset').show();
                $('#bpnumberDiv').hide();
                $('#polenumberDiv').hide();

                $('#tpsodl_to_get_near_consumers').hide();
                clearData();
                $("#submitFeatureData").html("Submit");
				trail_circle && (mapref.removeLayer(trail_circle), trail_circle = void 0);
            })
        };
        var clearData = function() {
            tpsodl_feature_values = undefined;
            mapref.removeLayer(ol)
            coord = ""
            mapref.removeLayer(vector);
            mapref.removeLayer(trace_layer);
            mapref.removeLayer(draw);
            $.publish("clearHighlight", ["main_map"]);
            $.publish("clearPopovers");
            mapref.removeInteraction(draw);

			// $('#fwb_dataset').val("default");
			var featureType = $("#featureType");
			featureType.empty();
			
			var option = $("<option />");
			option.html('-- Search Feature --');
			option.val('default');
			featureType.append(option);
			
            $('#fwb_specialquery').val("default");
            $('#featureType option[value="default"]').prop('selected', 'selected');
            $('#distance_in_meters').val('0').attr('value', '0');
            // $('#distance_in_meters').attr('placeholder', "Provide value");
            $("#submitFeatureData").attr("disabled", false);
			// $("#specialQueryDiv").hide();
            selectedColl = undefined;
            req_urns = undefined
            coord = ""
            if (resultsList) {
                resultsList.clear();
            }
			trail_circle && (mapref.removeLayer(trail_circle), trail_circle = void 0);
            spinOff();

        }
        var enableButtons = function() {

            $("#submitFeatureData").attr("disabled", false);
            $("#tpsodl_fwb_clear").attr("disabled", false);
            $("#tpsodl_to_get_near_consumers").attr("disabled", false);
        }
        var disableButtons = function() {
            $("#submitFeatureData").attr("disabled", true);
            $("#tpsodl_fwb_clear").attr("disabled", true);
            $("#tpsodl_to_get_near_consumers").attr("disabled", true);
        }
		
        var draw_buffer = function() {
			console.log($('#distance_in_meters').val(),"----");
			if(buffer_selected_criteria == "Point"){
				trail_circle && (mapref.removeLayer(trail_circle), trail_circle = void 0);
				var radius = $('#distance_in_meters').val();
				
				var coords = ol.proj.transform([trail_coord[0],trail_coord[1]], 'EPSG:900913', 'EPSG:4326');
				var mycircle = new ol.geom.Circle(ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857'), Number(radius));

				var circleFeature = new ol.Feature(mycircle);

				// Source and vector layer
				var vectorSource = new ol.source.Vector({projection: 'EPSG:4326'});
				vectorSource.addFeature(circleFeature);
				
				trail_circle = new ol.layer.Vector({
					source: vectorSource
				});
				
				mapref.addLayer(trail_circle);

			}
		}
        var selection_Succes = function(res) {
            mapref.removeLayer(trace_layer);
            raiseSuccessMessage(Messages.tpsodl_feature_within_buffer.SucessMsg);

			draw_buffer();
            tpsodl_feature_values = res;
            if (res.geom != undefined) {
                console.log(res.geom.coordinates)

                var vectorSource = new ol.source.Vector({});
                var Featuremarker = new ol.Feature({
                    geometry: new ol.geom.Point(res.geom.coordinates)
                });
                Featuremarker.setStyle(iconStyle);
                vectorSource.addFeature(Featuremarker);
                trace_layer = new ol.layer.Vector({
                    name: "Trace Layer",
                    source: vectorSource,
                    style: F
                });

                mapref.addLayer(trace_layer)

            }

            if (res.features != undefined) {

                if (res.geographic_context != undefined) {

                    resultsList.renderResults(res.features.features, {
                        geographic_context: res.geographic_context,
                        resultType: $('.module-body select#queryType', $cardSelector).val(),
                        showMarkers: true,
                        showNumberBadges: true,
                        export: {
                            title: "Export Details",
                            fileName: "export_data."
                        }
                    })
                } else {
                    resultsList.renderResults(res.features.features, {
                        showMarkers: true,
                        showNumberBadges: true,
                        export: {
                            title: "Export Details",
                            fileName: "export_data."
                        }
                    })
                }
            } else {

                raiseValidationError(res.error)
                if (resultsList) {
                    resultsList.clear();
                }
            }
            enableButtons()
            spinOff();

        }

        var Selection_Error = function(res) {
            spinOff()
            raiseValidationError(Messages.common_messages.errMsg)
            enableButtons()

        }

        var get_FeaturesInfo = function() {
			
            var buffer_collections = {
                method: 'getFeaturesInfo',
				ds_name: $("#fwb_dataset").val(),
                json: 'true'
            }
            CommsLayer.getGSSRequest(buffer_collections, featuresInfo_Succes, null);
        }

        var featuresInfo_Succes = function(res) {
            var buffer_colls = res.collection_list;
            var sorted_colls = sortKeys(buffer_colls);
            buffer_colls = sorted_colls;
			
			var featureType = $("#featureType");
			featureType.empty();
			
			var option = $("<option />");
			option.html('-- Search Feature --');
			option.val('default');
			featureType.append(option)
			
            var featureType = $("#featureType");

            $.each(buffer_colls, function(k, v) {
                var option = $("<option />");
                option.html(k);
                option.val(v);
                featureType.append(option)
            });
            $("#featureType").change(function() {
                selectedColl = $(this).children("option:selected").val();

            });

        }

        function sortThings(a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();

            return a > b ? 1 : b > a ? -1 : 0;
        }

        function sortKeys(collections) {
            var key = (Object.keys(collections)).sort(sortThings);


            var temp = {};

            for (var i = 0; i < key.length; i++) {
                temp[key[i]] = collections[key[i]];
                delete collections[key[i]];
            }

            for (var i = 0; i < key.length; i++) {
                collections[key[i]] = temp[key[i]];
            }
            return collections;
        }

    });