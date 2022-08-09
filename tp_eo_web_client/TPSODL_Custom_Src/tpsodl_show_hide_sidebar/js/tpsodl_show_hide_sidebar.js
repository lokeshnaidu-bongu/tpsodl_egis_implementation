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
        },
        map = function(a, b) {
            mapRef = b,
                mapName = a,
                init()
        };
    mapInit();
    var initialise = function() {
        $("#showHideToolbar").click(function() {
            var u;
            if ($("#showHideToolbar").hasClass('icon-ico_chevron_up_lg')) {
                u = 0,
                    $("#showHideToolbar").removeClass('icon-ico_chevron_up_lg');
                $("#showHideToolbar").addClass('icon-ico_chevron_down_lg');
                $(".map-toolbar").css("display", "none");
            } else {
                u = 90,
                    $(".map-toolbar").css("display", "block");
                $("#showHideToolbar").removeClass('icon-ico_chevron_dowm_lg');
                $("#showHideToolbar").addClass('icon-ico_chevron_up_lg');
            }
        });
        $("#showHideSidebar").click(function() {
            var u;
            var p = $("#sidebarContainer"),
                q = $("#mapContainer"),
                b,
                c,
                d,
                t = !1,
                e = 0.9166666666666666,
                f = $(window).width();
            if ($("#showHideSidebar").hasClass('icon-ico_chevron_right_lg')) {
                u = 0,
                    $("#showHideSidebar").removeClass('icon-ico_chevron_right_lg');
                $("#showHideSidebar").addClass('icon-ico_chevron_left_lg');
                $(".frame-controls").css('z-index', 0);
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
                u = 90,
                    $("#showHideSidebar").removeClass('icon-ico_chevron_left_lg');
                $("#showHideSidebar").addClass('icon-ico_chevron_right_lg');
                $(".frame-controls").css('z-index', 1);
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