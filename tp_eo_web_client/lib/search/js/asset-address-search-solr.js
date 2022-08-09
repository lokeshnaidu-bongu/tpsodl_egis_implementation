/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery", "underscore", "window-manager", "map-search-component/asset-address-search", "map-helper", "comms", "map-loader", "server-config", "map-core-component/pubsub"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i, j = {},
        k = h.solrQuery || "/asset",
        l = e.getMapProjection(),
        m = function(a, b) {
            s({
                id: a
            }, {
                mapNames: [b]
            })
        },
        n = function() {
            a.subscribe("gotoAsset", m)
        },
        o = function() {
            a.unsubscribe(["gotoAsset", m])
        },
        p = function(b, c) {
            var d = a("#query"),
                h = d.data("search-tag") || "*",
                j = e.getCurrentMapCentre(),
                l = e.transformToLonLat(j),
                m = l[1].toFixed(6) + "," + l[0].toFixed(6),
                n = g.assetSearchSpatialBoost || "0";
            i = b, d.focus();
            var o = {};
            f.isUnauthenticatedApp() || (o = {
                Authorization: "Bearer " + f.getBearerToken()
            }), a.ajax({
                url: k,
                data: {
                    q: "text:" + r(b),
                    fq: "*" === h ? void 0 : "tag:" + h,
                    wt: "json",
                    fl: "url,type,position,content",
                    sort: "score desc",
                    rows: 10,
                    sfield: "position",
                    defType: "edismax",
                    bf: "recip(geodist(),1,200,200)^" + n,
                    pt: m
                },
                headers: o,
                async: !0,
                dataType: "json",
                success: function(b) {
                    var d, e = !0,
                        f = {};
                    b.response ? (d = b.response.docs, d.sort(function(a, b) {
                        var c = a.type.toLowerCase(),
                            d = b.type.toLowerCase();
						
                        return c < d ? -1 : c > d ? 1 : 0
                    }), d = a.map(d, function(a, b) {
						// console.log(a.content)
						// console.log("----Asset----")
						//TODO :triveni
                        return a.content && a.content.length > 0 && (a.id = a.url, a.value = a.content[0], a.facet = a.type), e ? (0 === b && (a.facet = "Top Result"), f[a.facet] || (b > 0 && (a.firstOfFacet = !0), a.displayFacet = a.facet, f[a.facet] = !0), a) : a
                        // var test =  (a.content && a.content.length > 0 && (a.id = a.url, a.value = a.content[0], a.facet = a.type), e ? (0 === b && (a.facet = "Top Result"), f[a.facet] || (b > 0 && (a.firstOfFacet = !0), a.displayFacet = a.facet, a.title =a.content[0], f[a.facet] = !0), a) : a);
						// console.log(test);
						// return test;
                    })) : console.log("Search failed: " + b.error.msg), c(d)
                }
            })
        },
        q = function(a, b, c, d, e) {
            var f = {
                value: a,
                id: c
            };
            return e ? f.location = e.join(",") : f.location = "", d ? f.position = d : f.position = "", b ? f.facet = b : f.facet = "", f
        },
        r = function(a) {
            var b = ["+", "-", "&", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "\\", "/"],
                c = new RegExp("(\\" + b.join("|\\") + ")", "g"),
                d = "";
            return a = a.replace(c, "\\$1"), d = a.split(/[\s,-]/).pop(), d = d.length > 0 ? a + ", " + d + "*" : a
        },
        s = function(b, d) {
            var e = b.id,
                g = {
                    service: "ejb/ObjectInfoLocal",
                    method: "info",
                    json: !0,
                    crs: l.name,
                    objects: e,
                    return_info: "geographic_context",
                    result_type: "all",
                    format_fields: !0
                };
            c.isTouchDevice() && a("#query").typeahead("val", i), f.getGSSRequest(g, function(b) {
                for (var c = 0; c < d.mapNames.length; c++) a.publish("gotoServerAsset", [b, d.mapNames[c], e])
            }, function(a, b, c) {
                console.log(a, b, c)
            })
        },
        t = function(b, c) {
            a.publish("gotoAddress", [b, c])
        };
    n();
    var u = {
        gotoAsset: s,
        gotoAddress: t,
        searchAssetIndex: p,
        eventUnsubscribe: o
    };
    return u.__TEST_ONLY__ = {
        getFacetedResult: q,
        wildcardSearchString: r,
        setMap: function(a) {
            j = a
        }
    }, u
});