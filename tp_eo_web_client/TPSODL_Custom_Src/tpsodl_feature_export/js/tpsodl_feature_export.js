/**
 * Configurable Sidebar component for displaying KML Export panel.
 * @module HelloSmallworld
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
        'jquery',
        'underscore',
        'i18n!custom/nls/messages',
        'text!tpsodl_feature_export_partials/tpsodl_feature_export.html',
        'hogan',
        'comms',
        'map-core-component/pubsub',
        'spinner',
        'download'
    ],
    function tpsodl_feature_export($, _, Messages, template, hogan, CommsLayer) {
        'use strict';
        var mapref, selectedDs, selectedColl, selected_object, geom_type, $spinner, colls = [];
        var cardTemplate = hogan.compile(template),
            sidebarControlName = 'tpsodl_feature_export',
            $cardSelector;

        var req_id, sess_id;

        var asyncCall = {
            service: "ejb/AdminLocal",
            method: "getResult",
            request_id: void 0,
            session_id: void 0,
            json: !0
        }

        /**
         * @memberof module:KMLExport
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
                if (target === sidebarControlName) {
                    //what should be done on leaving KMLExport sidebar
                }
            });

            $.subscribe('gotoSidebar', function(target) {
                if (target === sidebarControlName) {
                    // what should be done on entering KMLExport sidebar
                }
            });

            $.subscribe('mapInitialised', function(mapNameRef, olMapRef) {
                // what should happen when map is initialized
                $spinner = $($cardSelector).find('#kml_spinner');

                mapref = olMapRef;
            });

            $.subscribe("popoverButtonVisibilityControl", function(b, c, e) {
                // Parameter b is used as trace button, c is urn and e is object contains type and coordinates
                if (e != undefined) {

                    geom_type = e.type
                    selected_object = c;
                }
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

        var raiseInfoMessage = function raiseWarningMessage(infoMessage) {

            $.publish("raiseTempMessage", [infoMessage, {
                messageType: "info"
            }]);
        };

        var initialise = function initialise(selector) {
            $cardSelector = selector;
            get_datasets();
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

        var buildUI = function buildUI() {
            var options = {
                messages: Messages,
            };

            $cardSelector.append(cardTemplate.render(options));
            $("#submitKml").click(function() {

                var collection = colls[colls.length - 1]

                if (colls.length > 0) {
                    //$("#submitKml").attr("disabled", true);
                    if (selected_object != undefined && (geom_type == "Polygon" || geom_type == "MultiPolygon")) {
                        var result = {
                            json: false,
                            async: true,
                            urn: selected_object,
                            selColl: collection
                        }

                        CommsLayer.postGSSRequest(result, "?method=getData", createKml_success, createKml_Error);
                    } else {
                        raiseWarningMessage(Messages.tpsodl_feature_export.SelectPolygon)
                    }

                    //spinOn();
                } else {
                    raiseWarningMessage(Messages.tpsodl_feature_export.kmlValidation)
                }
            })

            $("#clearKml").click(function() {
                colls = []
                selectedColl = undefined
                selected_object = undefined
                $('#cblist').html("");
                $("#getDatasets").val("default");
                $.publish("clearHighlight", ["main_map"]);
                $.publish("clearPopovers");
                //$("#submitKml").attr("disabled", false);
                $('#collections').css("display", 'none');

                spinOff();
            })

        }

        var createKml_success = function createKml_success(res) {
            // spinOff()
            raiseInfoMessage("A KML Report has been requested.  It will download automatically when complete")
            req_id = res.request_id
            sess_id = res.session_id
            getResult(req_id, sess_id)


        }

        var getResult = function(resId, sessId) {
            asyncCall.request_id = resId
            asyncCall.session_id = sessId
            CommsLayer.getGSSRequest(asyncCall, KMLReportSuccCall, KMLReportFailCall, {
                cache: !1
            })
        };

        var KMLReportSuccCall = function(kmlData) {

            kmlData.message ? (downloadReport(kmlData)

            ) : window.setTimeout(function() {
                getResult(req_id, sess_id)
            }, 300)
        };

        var downloadReport = function(res) {
            if (res.message != "Success") {
                raiseValidationError(res.message)

            } else {
                if (res.responses.length == 0) {
                    raiseWarningMessage(Messages.tpsodl_feature_export.NoDataFound)

                } else {
                    for (var i = 0; i < res.responses.length; i++) {

                        var c = /^.*\/\/.*?(\/(gss|resource).*)$/.exec(res.responses[i]),
                            d = /plot\/(.*kml)/.exec(res.responses[i]),
                            f = new XMLHttpRequest;

                        var status = downloadFile(c[1], d, f)
                    }
                }

            }

        }

        var KMLReportFailCall = function() {

            raiseValidationError("Server error")
        }

        var downloadFile = function downloadFile(c2, d, f) {
            raiseSuccessMessage(Messages.tpsodl_feature_export.ReportGenerated)
            if (f.open("GET", c2, !0), !CommsLayer.isUnauthenticatedApp()) {
                var g = CommsLayer.getBearerToken();
                f.setRequestHeader("Authorization", "Bearer " + g)
            }

            f.responseType = "blob", f.onload = function() {
                // if (200 === f.status ) {
                var b = d[1],
                    c = new Blob([f.response], {
                        type: "application/kml"
                    });
                $.publish("clientItemReadyForDownload", [{
                    type: "kml",
                    blob: c,
                    fileName: b,
                    title: "KML Export",
                    date: new Date
                }])
                // }
            }, f.send();

            return "Downloaded"
        }

        var createKml_Error = function createKml_Error() {
            spinOff();
            raiseValidationError(Messages.tpsodl_feature_export.errorMsg)

        }

        var get_datasets = function() {
            var ds_val = {
                json: false,
                method: 'getDatasets'
            }
            CommsLayer.getGSSRequest(ds_val, selection_Succes, Selection_Error);
        };

        var selection_Succes = function selection_Succes(res) {
            var datasets = res.datasets
            var ds = $("#getDatasets");

            $.each(datasets, function(k, v) {
                var option = $("<option />");
                option.html(v);
                option.val(v);
                ds.append(option)
            });

            $("#getDatasets").change(function() {
                //getCollections
                $("#cblist").empty();
                selectedDs = $(this).children("option:selected").val();
                if (selectedDs == "default") {
                    $("#cblist").empty();
                    $('#collections').css("display", 'none');
                } else {
                    var selectedDataset = {
                        json: true,
                        method: 'getCollections',
                        ds: selectedDs
                    }
                    CommsLayer.getGSSRequest(selectedDataset, selectedColl_success, selectedColl_failure)
                }
            });
        }

        var selectedColl_success = function(res) {
            $('#collections').css("display", 'block');
            var collections = res.collections;

            var sorted_collections = sortKeys(collections);

            collections = sorted_collections;

            var container = $('#cblist');

            $.each(collections, function(k, v) {

                $('<input />', {
                    type: 'radio',
                    name: 'collections',
                    id: k,
                    value: v,
                    class: 'col-sm-4'
                }).appendTo(container);
                $('<label />', {
                    'for': k,
                    text: k
                }).appendTo(container);
                $('<br/>').appendTo(container)
            });

            $(document).ready(function() {

                $('input[type="radio"]').click(function() {

                    colls.push(this.value)
                });
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
            console.log(collections)
            return collections;
        }

        var selectedColl_failure = function() {
            spinOff();

        }

        var Selection_Error = function Selection_Error() {
            raiseValidationError(Messages.common_messages.errMsg)
        }

    });