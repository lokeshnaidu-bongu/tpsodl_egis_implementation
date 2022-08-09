/*! ElectricOfficeWeb 5.0.1 2019-12-09 */
define(["jquery", "underscore", "i18n!nls/messages", "hogan", 'map-loader', 'map-helper', 'map-google', "OpenLayers3", "proj4"], function($, _, messages, hogan, mapdsConfig, MapHelper, google, OpenLayers3, proj4) {
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
            $.subscribe("mapInitialised", map)
            $("#only_map_component_view").css('display', "inline")
            $("#projectionDiv").css('display', "inline")
        },
        map = function(a, b) {
            mapRef = b,
                mapName = a,
                init()
        };
    mapInit();
    var flag = false;
    var initialise = function() {
        var mapToolbarvisibilityStatus, sidebarvisibilityStatus;
        var u;
        $("#only_map_component_view").click(function() {
            var p = $("#sidebarContainer"),
                q = $("#mapContainer"),
                b,
                c,
                d,
                t = !1,
                e = 0.9166666666666666,
                f = $(window).width();
            if (!flag) mapToolbarvisibilityStatus = $(".map-toolbar").css('display'), sidebarvisibilityStatus = $("#showHideSidebar").hasClass('icon-ico_chevron_right_lg');
            if (!flag) {
                u = 0;
                $("#only_map_component_view").css('color', "#ffffff");

                $(".frame-controls").css('z-index', 0);
                flag = true;
                $("#app-window").css('height', "calc(100% - 0px)");
                $(".map-toolbar").css("display", "none");
                $(".navbar.navbar-static-top.navbar-default").css('display', "none");

                if (t ? (b = Math.floor((f - u) * e), c = f - b - u) : (b = f - u, c = 0), q[0] && (q.height($(window).height() - q.offset().top), q.width(b), q.css("right", c + u), q.css("width", b)), n) {
                    var g = n.getCenter();
                    window.google.maps.event.trigger(n, "resize"),
                        n.setCenter(g)
                }
                p.css("left", b),
                    p.css("width", c),
                    mapRef.updateSize(),
                    d = "" + mapRef.getSize()[0],
                    $(".modal-backdrop").css("width", d)

            } else {
                if (sidebarvisibilityStatus)
                    u = 90;
                $("#only_map_component_view").css('color', "#bbb");
                $(".frame-controls").css('z-index', 1);
                flag = false;
                $("#app-window").css('height', "calc(100% - 50px)");
                if (mapToolbarvisibilityStatus == "block")
                    $(".map-toolbar").css("display", "block");
                $(".navbar.navbar-static-top.navbar-default").css('display', "block");

                if (t ? (b = Math.floor((f - u) * e), c = f - b - u) : (b = f - u, c = 0), q[0] && (q.height($(window).height() - q.offset().top), q.width(b), q.css("right", c + u), q.css("width", b)), n) {
                    var g = n.getCenter();
                    window.google.maps.event.trigger(n, "resize"),
                        n.setCenter(g)
                }
                p.css("left", b),
                    p.css("width", c),
                    mapRef.updateSize(),
                    d = "" + mapRef.getSize()[0],
                    $(".modal-backdrop").css("width", d)
                var tool = $("#sidebar-controls a.selected").data("target");
                if (tool != "map_view") {
                    $.publish("openSidebarToItem", [tool]);
                }


            }


        });
    }
});