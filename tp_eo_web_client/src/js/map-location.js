/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery", "underscore", "i18n!nls/messages", "hogan", "OpenLayers3", "popovers", "map-helper", "comms", "text!partials/map-location-popover.html", "text!partials/map-location-popover-inner.html", "map-loader"], function(a, b, c, d, e, f, g, h, i, j, k) {
    "use strict";
    var l, m, n, o, p = !1,
        q = !1,
        r = function() {
            u(), x()
        },
        s = function() {
            a.subscribe("mapInitialised", t)
        },
        t = function(a, b) {
            l = b, m = a, r()
        };
    k.mapLocation && s();
    var u = function() {
            a("#enableMapClick").click(function() {
                q ? w(a(this)) : v(a(this))
            })
        },
        v = function(b) {
            q = !0, b.addClass("btn-selected"), a.publish("wmtsClickDeactivate")
        },
        w = function(b) {
            q = !1, b.removeClass("btn-selected"), a.publish("wmtsClickActivate")
        },
        x = function() {
            l.on("click", function(a) {
                q && y(a)
            })
        },
        y = function(b) {
            var d = function() {
                a.unsubscribe(["popoverCleared", d]);
                var e = b.coordinate;
                n = g.transformToLonLat(e), f.setTemplate(i, j), f.createMapClickPopup(e, {
                    name: c.map_location.popoverTitle
                }, l, m), z(n)
            };
            a.subscribe("popoverCleared", d)
        },
        z = function(b) {
            p || (a.publish("getReverseGeocodeResult", [{
                map: l,
                lonLat: b,
                callback: function(a) {
                    o = a, A(b)
                }
            }]), p = !0)
        },
        A = function(a) {
            var b = {
                json: !0,
                service: "ejb/MapLocationLocal",
                method: "getCoordMapLocation",
                info_types: "coord_nearest_objects,coord_overlapping_areas",
                coord: a[0] + "," + a[1],
                crs: "EPSG:4326"
            };
            h.getGSSRequest(b, B, F)
        },
        B = function(d) {
			if (typeof what3words != 'undefined'){
				what3words.api.convertTo3waGeoJson({lat:n[1], lng:n[0]}, 'en')
				.then(function(response) {
					 console.log("[convertTo3wa]", response);
					console.log(response.features[0].properties.words)
					var temp_words =  response.features[0].properties.words
					addInfotoPopup(d,temp_words)
				});
			
			}else{
				addInfotoPopup(d,undefined)
			}
        },
		
		addInfotoPopup = function(d,words_text){
			d.name = c.map_location.popoverTitle, b.each(d, function(a, e) {
					b.each(a, function(a, b) {
						"coord_nearest_objects" === b && (d.objects[c.map_location.coordNearestObjects] = d.objects.coord_nearest_objects, delete d.objects.coord_nearest_objects), "coord_overlapping_areas" === b && (d.objects[c.map_location.coordOverlappingAreas] = d.objects.coord_overlapping_areas, delete d.objects.coord_overlapping_areas)
					})
				});
				d.objects[c.map_location.addressTitle] = [{
					name: null,
					description: o
				}];
				d.objects[c.map_location.gps] = [{
					name: c.map_location.lon,
					// description: C(n[0], "LON", "DMS") // No need to change value to Degree Minutes
					description: C(n[0], "LON", "")
				}, {
					name: c.map_location.lat,
					// description: C(n[1], "LAT", "DMS") // No need to change value to Degree Minutes
					description: C(n[1], "LAT", "")
				}];
				
				if (typeof what3words != 'undefined'){

				d.objects["What3words"] = [{
					name: "Words",
					// description: C(n[0], "LON", "DMS") // No need to change value to Degree Minutes
					description: words_text//getWhat3words(n[1], n[0],d)
				}];
				};
				 f.updateLocationInformation(d), f.resetTemplatesToDefault(), p = !1, w(a("#enableMapClick")), a.publish("afterPopupCreated")
			
		},
        C = function(a, b, c) {
            var d = a;
            return "DMS" === c && (d = D(a, b)), d
        },
        D = function(a, b) {
            var c = [],
                d = Math.abs(a),
                e = Math.floor(d),
                f = (d - e) / (1 / 60),
                g = f;
            f = Math.floor(f);
            var h = (g - f) / (1 / 60);
            return h = Math.round(10 * h), h /= 10, e < 10 && (e = "0" + e), f < 10 && (f = "0" + f), h < 10 && (h = "0" + h), c[0] = e + "°", c[1] = f + "'", c[2] = h + "''", c[3] = E(a, b), c.join(" ")
        },
        E = function(a, b) {
            var c;
            return "LAT" === b ? c = a >= 0 ? "N" : "S" : "LON" === b && (c = a >= 0 ? "E" : "W"), c
        },
        F = function(b) {
            a.publish("raiseStickyMessage", [c.map_location.requestFaild, {
                messageType: "warning",
                errorMessage: b.responseText
            }])
        },
        G = {};
    return G.__TEST_ONLY__ = {
        initMapClickEvent: x,
        handleClickEvent: y,
        doRequest: z,
        initEnableButtonEvent: u,
        locationDataCallback: B,
        getLocationData: A,
        setMap: function(a) {
            l = a
        },
        getMap: function() {
            return l
        },
        getRequestRunning: function() {
            return p
        },
        setRequestRunning: function(a) {
            p = a
        },
        setcurrentLonLat: function(a) {
            n = a
        },
        getcurrentLonLat: function() {
            return n
        },
        mapLocationEnabled: function() {
            return q
        }
    }, G
});