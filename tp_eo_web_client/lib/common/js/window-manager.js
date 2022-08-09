/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery", "underscore", "map-loader", "i18n!nls/messages", "i18n!viewer/nls/messages", "text!viewer-partials/map.html", "text!viewer-partials/sidebar.html", "text!viewer-partials/sidebar-controls.html", "hogan", "wdio-functions", "auth-pre-check", "comms", "map-core-component/pubsub", "map-layer-auth", "map-core"], function(a, b, c, d, e, f, g, h, i, j, k, l) {
    "use strict";
    var m, n, o, p, q, r = a("#sidebarContainer"),
        s = a("#mapContainer"),
        t = a("#sidebar-controls"),
        u = c.ProductName || "network-viewer-app",
        v = !1,
        w = 90,
        x = 1,
        y = 12,
        z = i.compile(f),
        A = i.compile(g),
        B = i.compile(h),
        C = [{
            target: "map_view",
            icon: "icon-map2"
        }],
        D = {
            mapName: "default",
            searchTag: "*"
        },
        E = function(b) {
            a.subscribe("retrievedAuthorizedLayers", function() {
                F(b)
            }), k.redirectToLoginIfNecessary()
        },
        F = function(f) {
            d.documentHeader = u, d.documentTitle = u, N(d), c.SideBarControls ? (Array.prototype.push.apply(C, c.SideBarControls), b.each(C, function(a, b) {
                var c;
                e[a.target] ? c = e[a.target].componentName : d[a.target] && (c = d[a.target].componentName), c && (C[b].label = c)
            })) : (w = 0, x = 0), J(), r = a("#sidebarContainer"), s = a("#mapContainer"), t = a("#sidebar-controls");
            var g = b.extend(D, f.mapFrameOptions || {});
            s.append(z.render({
                options: g,
                messages: d,
                controls: C,
                addressSearch: !!c.AddressSearch,
                mapVisualization: !!c.mapVisualization,
                mapLocation: !!c.mapLocation,
                schematicsButton: !!c.schematicsViewEnabled,
                mapCurrentLocation: !!c.mapCurrentLocationEnabled
            })), r.append(A.render({
                messages: d,
                controls: C
            })), t.append(B.render({
                messages: d,
                controls: C
            })), a("a", t).on("click touchend", G), a("a", t).on("mouseleave", function() {
                a(this).tooltip("hide")
            }), a("#query").on("click", function() {
                a("#query").select()
            }), a("a:first", t).addClass("selected"), n = a('a[data-target="map_view"]', t), b.each(C, function(b) {
                var c = a("#controls-targets #" + b.target + "-card");
                a.publish("sidebarContainerReady", [b.target, c]), b.fontAwesome ? require(["text!viewer-icons/icon-shadow.svg"], function(c) {
                    var d = '<i class="control-icon icon-' + b.icon + '" style="top:-16px;font-size:33px;"></i>';
                    a('a[data-target="' + b.target + '"]', t).html(c + d)
                }) : require(["text!viewer-icons/" + b.icon + ".svg", "text!viewer-icons/icon-shadow.svg"], function(c, d) {
                    a('a[data-target="' + b.target + '"]', t).html(d + c)
                })
            }), s.resize(function() {
                o && o.updateSize()
            }), f.eventSubscribe();
            var h = f.mapSelectorName;
            if (!h) {
                var i = g.mapName;
                h = '.map[data-map-name="' + i + '"]'
            }
            a(h).initializeMap({
                handleRightClicks: !0
            }), l.isUnauthenticatedApp() || a("#logout").initialiseLogout(), a.publish("appInitialised")
        },
        G = function() {
            var b = a(this),
                c = b.data("target");
            a("a", t).removeClass("selected"), b.addClass("selected"), m && a.publish("leavingSidebar", [m.data("target")]), a.publish("gotoSidebar", [c]), m = b, "map_view" === c ? (R(), a.publish("removeOverlay")) : (x = b.data("span"), Q(c))
        },
        H = function(b) {
            return a(".control-item ", t).find('[data-target="' + b + '"]')
        },
        I = function() {
            for (var a = Object.keys(j), b = 0; b < a.length; b++) {
                var c = a[b];
                window.olMapInstance[c] = j[c]
            }
        },
        J = function() {
            a.subscribe("resizeWindow", function() {
                O()
            }), a.subscribe("streetViewEnter", function() {
                K(), w = 0, v = !0, R()
            }), a.subscribe("streetViewExit", function() {
                L(), w = 90, O(o), o.updateSize()
            }), a.subscribe("triggerOverlay", function() {
                K()
            }), a.subscribe("overlayClosed", function() {
                L()
            }), a.subscribe("showSidebar", S), a.subscribe("hideSidebar", R), a.subscribe("openSidebarToItem", P), a.subscribe("mapInitialised", function(a, b, c, d) {
                o = b, p = c, q = d, o.on("moveend", M), window.olMapInstance = {
                    olMap: b,
                    googleMap: p,
                    mapName: a,
                    googleTraffic: q
                }, I()
            }), a(window).resize(O)
        },
        K = function() {
            a("#olmap").css("visibility", "hidden")
        },
        L = function() {
            a("#olmap").css("visibility", "")
        },
        M = function() {
            a.publish("getReverseGeocodeResult", [{
                callback: function(a) {
                    window.document.title = d.documentTitle + " " + a
                }
            }])
        },
        N = function(b) {
            window.document.title = b.documentTitle, a("#documentHeader").html(b.documentHeader), a("#poweredBy").html(b.documentPoweredBy), a("#documentSubHeader").html(b.documentSubHeader)
        },
        O = function() {
            var b, c, d, e = 1 - x / y,
                f = a(window).width();
            if (v ? (b = Math.floor((f - w) * e), c = f - b - w) : (b = f - w, c = 0), s[0] && (s.height(a(window).height() - s.offset().top), s.width(b), s.css("right", c + w), s.css("width", b)), p) {
                var g = p.getCenter();
                window.google.maps.event.trigger(p, "resize"), p.setCenter(g)
            }
            r.css("left", b), r.css("width", c), o.updateSize(), d = "" + o.getSize()[0], a(".modal-backdrop").css("width", d)
        },
        P = function(b) {
            var c = a("#sidebar-controls a.selected").data("target");
            Q(b), m = H(b), c && a.publish("leavingSidebar", [c]), a.publish("gotoSidebar", [b])
        },
        Q = function(b) {
            var c = H(b);
            a("a", t).removeClass("selected"), c.addClass("selected"), x = c.data("span"), O(o), S(), a("#sidebarContainer .sidebar-card:visible").hide(), a("#sidebarContainer .sidebar-card#" + b + "-container").show(), o.updateSize()
        },
        R = function() {
            v && (v = !1, O(o), r.hide(), o.updateSize())
        },
        S = function() {
            v || (v = !0, O(o), r.show(100, function() {
                o.updateSize()
            }))
        },
        T = !1;
    window.addEventListener("touchstart", function W() {
        T = !0, window.removeEventListener("touchstart", W, !1)
    }, !1);
    var U = function() {
            return T
        },
        V = {
            init: E,
            isTouchDevice: U
        };
    return V.__TEST_ONLY__ = {
        getMap: function() {
            return o
        },
        setMap: function(a) {
            o = a
        },
        setMapFrame: function(a) {
            s = a
        },
        setSidebarVisible: function(a) {
            v = a
        },
        openSidebarToItem: P,
        handleControlClick: G,
        getControl: H,
        eventSubscribe: J,
        setupMessages: N,
        resizeWindow: O,
        showOnly: Q,
        hideSidebar: R,
        showSidebar: S
    }, V
});