/**
 * Configurable Sidebar component for displaying bookmark panel.
 
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
        'jquery',
        'underscore',
        'i18n!nls/messages',
        'text!tpsodl_bookmarks_partials/tpsodl_bookmarks.html',
        'OpenLayers3',
        'hogan',
        'comms',
        'map-core-component/pubsub',
        'spinner',
		'datatables',
		"datatables.net-buttons",
		"datatables-btn-html"
    ],
    function Bookmark($, _, Messages, template, ol, hogan, CommsLayer) {
        'use strict';

        var cardTemplate = hogan.compile(template),
            sidebarControlName = 'tpsodl_bookmarks',
            $spinner,
            $cardSelector, username, map_info;

        var deleteBookmark = "https://" + window.location.hostname + ":32060/delete_bookmark",
            getBookMarks = "https://" + window.location.hostname + ":32060/get_bookmarks",
            createBookmark = "https://" + window.location.hostname + ":32060/create_bookmark";
		// var deleteBookmark = "https://" + "dc-gisdev-app1" + ":9005/delete_bookmark",
            // getBookMarks = "https://" + "192.168.200.35" + ":9005/get_bookmarks",
            // createBookmark = "https://" + "dc-gisdev-app1"+ ":9005/create_bookmark";
        /**
         * @private
         * 
         * @listens ViewerEvents.leavingSidebar
         * @listens ViewerEvents.gotoSidebar
         * @listens ViewerEvents.mapInitialised
         * @listens ViewerEvents.sidebarContainerReady
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
                if (target === sidebarControlName) {}
            });

            $.subscribe('gotoSidebar', function(target) {
                if (target === sidebarControlName) {
                    $("#bk_create").hide()
                    getBookmarks()
                }
            });

            $.subscribe('mapInitialised', function(mapNameRef, olMapRef) {
                // what should happen when map is initialized
                map_info = olMapRef
                $spinner = $($cardSelector).find('#bookmarks_spinner');
            });
        };
        $.subscribe("userData", function(data) {
            username = data.user;

        });
        eventSubscribe();
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
        var initialise = function initialise(selector) {
            $cardSelector = selector;
            buildUI();
        };
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
        $("#bk_create").hide();
        var displayDatatable = function(res_data) {

			console.log("displayDatatable")
			
            $('table#bookmarks_table').DataTable({

                scrollY: '40vh',
                scrollX: '2vh',
                dom: 'lB<"toolbar">frtip',
                destroy: true,
                buttons: [

                    {
                        text: '<i class="icon-trash" title="Delete Bookmark"></i>',
                        action: function(e, dt, node, config) {
                            callDeleteBookmark();
                        }
                    },
                    {
                        text: '<i class="icon-map-marker" title="Goto Bookmark"></i>',
                        action: function(e, dt, node, config) {
                            gotoBookmark();
                        }
                    },
                    {
                        text: '<i class="icon-bookmark" title="Create Bookmark"></i>',
                        action: function(e, dt, node, config) {
                            callCreateBookmark();
                        }
                    }

                ],
                language: {
                    search: "",
                    searchPlaceholder: "Search...",
                    lengthMenu: "_MENU_"
                },
                "pageLength": 5,
                "lengthMenu": [
                    [5, 10, -1],
                    [5, 10, "All"]
                ]

            })
            spinOff()
        }
        var gotoBookmark = function() {
            var selected_bookmark = $('input[name="bm_option_box"]:checked').val()

            if (selected_bookmark == undefined) {
                raiseWarningMessage("Select Bookmark")

            } else {
                var lat_long = selected_bookmark.split(",")

                map_info.getView().setCenter(ol.proj.transform([Number(lat_long[1]), Number(lat_long[0])], 'EPSG:4326', 'EPSG:3857'));
                map_info.getView().setZoom(Number(lat_long[2]));
            }
        }
        var callCreateBookmark = function() {
            $("#bk_create").show()
            $("#list_bookmarks").html("")
        }


        var callDeleteBookmark = function() {
            var selected_bookmark = $('input[name="bm_option_box"]:checked').attr('id')
            console.log(selected_bookmark)

            if (selected_bookmark == undefined) {
                raiseWarningMessage("Select Bookmark")

            } else {
                $.ajax({
                    type: "POST",
                    data: JSON.stringify({
                        bookmark_name: selected_bookmark
                    }),
                    contentType: "application/json",
                    url: deleteBookmark,
                    crossDomain: true,
                    dataType: "json"
                }).done(function(res) {
                    getBookmarks()
                })
            }
        }


        //To create table structure
        var makeGetBookmarksDataTable = function(res_data) {

            var data = ""
            data += '<table id="bookmarks_table" class="display" style="width:70%;" border="1">'
            data += '<thead><tr>';
            data += '<th style="min-width:50px; text-align:center;">Select</th>';
            data += '<th style="min-width:150px; text-align:center;">Bookmark Name</th>';

            data += '</thead>'
            data += '<tbody>'
            if (!$.isEmptyObject(res_data)) {




                $.each(res_data, function(key, record) {
                    console.log(record)
                    data += '<tr>';
                    data += ' <td class="bookmark_checkbox" style=" text-align:center;"><input type="radio" name="bm_option_box" id="' + record.bookmark_name + '" value=' + record.latitude + "," + record.longitude + "," + record.zoom + ' /></td>';
             
                    data += ' <td style="min-width:150px; text-align:center;">' + record.bookmark_name + '</td>';

                    data += '</tr>';
                });



            }
            data += '</tbody></table>'
            $("#list_bookmarks").append(data).trigger('create');
            displayDatatable()

        }
        var getBookmarks = function() {
            console.log("1111111")
            spinOn()
            $("#list_bookmarks").html("")

            $.ajax({
                type: "POST",
                data: JSON.stringify({
                    username: username
                }),
                contentType: "application/json",
                url: getBookMarks,
                crossDomain: true,
                dataType: "json",
                error: function(returnval) {
                    spinOff();
                },
                success: function(returnval) {
                    $("#list_bookmarks").empty();
                    makeGetBookmarksDataTable(returnval.bms_data)
                }
            })

			
            // $.ajax({
                // type: "POST",
                // data: JSON.stringify({
                    // username: "gss_user"
                // }),
                // contentType: "application/json",
                // url: getBookMarks,
                // crossDomain: true,
                // dataType: "json"
            // }).done(function(res) {
                 // if (res.bms_data.length == 0) {
                     // raiseWarningMessage("No bookmarks found");
                     // return;
                 // }
             // makeGetBookmarksDataTable(res.bms_data)
            // })
        }

        var buildUI = function buildUI() {
            var options = {
                messages: Messages,
            };
            $cardSelector.append(cardTemplate.render(options));



            $("button#getBookMarks").click(function() {
                $("#bk_create").hide()

                getBookmarks()

            });


            $("button#bk_save").click(function() {


                var bk_name = $("input#bk_name").val();
                if (bk_name == "" || bk_name == undefined) {
                    raiseWarningMessage("Please enter bookmark name");
                } else {
                    var window_url = window.location.href,
                        split_url = window_url.split("/"),
                        url_data = split_url[6].split(","),
                        lat = url_data[0],
                        lon = url_data[1],
                        zoom = url_data[2],
                        zoom_val = zoom.substring(0, zoom.length - 1);

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify({
                            username: username,
                            latitude: lat,
                            longitude: lon,
                            zoom: zoom_val,
                            creation_date: dateNow() + " " + timeNow(),
                            bookmark_name: bk_name
                        }),
                        contentType: "application/json",
                        url: createBookmark,
                        crossDomain: true,
                        dataType: "json"
                    }).done(function(data) {
                        console.log(data)
                        if (data.status == 200) {
                            $("input#bk_name").val("")
                            raiseSuccessMessage(data.success)
                        }

                    })
                }
            });


            function dateNow() {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!

                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }
                return yyyy + '-' + mm + '-' + dd;
            }

            function timeNow() {
                var currentTime = new Date()
                var hours = currentTime.getHours()
                var minutes = currentTime.getMinutes()
                var seconds = currentTime.getSeconds()
                if (minutes < 10)
                    minutes = "0" + minutes;
                if (seconds < 10)
                    seconds = "0" + seconds;
                return hours + ":" + minutes + ":" + seconds;
            }



        };
        // End build-UI 

    });