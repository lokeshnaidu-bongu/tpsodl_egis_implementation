/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery", "underscore", "OpenLayers3", "map-helper", "i18n!viewer/nls/messages", "map-loader", "text!results-list-partials/results-list.html", "text!results-list-partials/paging.html", "text!results-list-partials/filter.html", "text!viewer-partials/popover.html", "hogan", "text!results-list-partials/marker_normal.svg", "export", "popovers", "map-core-component/pubsub"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    "use strict";
    var o, p = k.compile(g),
        q = k.compile(j),
        r = k.compile(l),
        s = k.compile(h),
        t = k.compile(i),
        u = {
            useGeographic: !0,
            selector: void 0,
            paging: !0,
            pageSize: 10,
            map: {
                olMap: void 0,
                mapName: void 0
            },
            parentComponent: void 0,
            parentComponentResultType: void 0
        },
        v = function(g) {
            var h, i, j, k, l, m, u, v, w = g,
                x = g.selector,
                y = !1,
                z = !1,
                A = g["export"] || !1,
                B = g.filter || !1,
                C = function() {
                    a.subscribe("leavingSidebar", function() {
                        D()
                    }), a.subscribe("beforePopupCreated", function() {
                        D(), a(".result.selected", x).removeClass("selected")
                    })
                },
                D = function() {
                    var b = a.support.transition;
                    a.support.transition = null, a(".result.selected", x).popover("destroy"), i ? i.popover("destroy") : "", a.support.transition = b
                },
                E = function(a, c) {
                    var d, f;
                    j = a, u = b.extend({
                        pageNumber: 1,
                        showMarkers: !1,
                        showNumberBadges: !1,
                        geographic_context: [],
                        resultType: void 0,
                        "export": {
                            fileName: e.results_list.exportDefaultFileTitle,
                            title: e.results_list.exportDefaultFileName
                        }
                    }, c), y = u.showMarkers, z = u.showNumberBadges, w.parentComponentResultType = u.resultType, d = u.pageNumber, f = {
                        results: j,
                        geographic_context: u.geographic_context,
                        contexts: u.contexts
                    }, k = $(f), l = k, w.paging ? S(d) : m = l, I(), u.keepCurrentFilter ? Z() : v = void 0, F()
                },
                F = function() {
                    fa();
                    var b = m.total.filtered ? m.total.filtered : m.total.count;
                    m.total.end > b && (m.total.end = b), 0 === b && (m.total.start = 0);
                    var c = {
                        total: m.total,
                        results: m.results,
                        messages: e,
                        filters: G,
                        options: {
                            "export": {
                                active: f.isAvailable("download") && A && ga().length > 0,
                                optionsList: ga()
                            },
                            filter: B,
                            filterActive: H()
                        }
                    };
                    if (a.isNumeric(m.total.filtered)) {
                        var d = m.total.filtered ? m.total.start : 0,
                            g = m.total.filtered ? m.total.end : 0;
                        c.listCount = e.results_list.listFilteredCount.replace("$1", m.total.filtered).replace("$2", m.total.count).replace("$3", d).replace("$4", g)
                    } else c.listCount = e.results_list.listCount.replace("$1", m.total.count).replace("$2", m.total.start).replace("$3", m.total.end);
                    c.showNumberBadges = z, x.html(p.render(c)), y && ba(), a(".result", x).click(V), a(".btn.filter", x).click(J), a(".btn-group.export li a", x).click(Q), a(".btn-group.export", x).click(function() {
                        i ? i.popover("destroy") : ""
                    }), R()
                },
                G = [],
                H = function() {
                    return a.isNumeric(m.total.filtered)
                },
                I = function() {
                    var a = {};
                    G = [], b.each(k.results, function(b) {
                        a[b.type] = b.type
                    }), b.each(a, function(a) {
                        G.push({
                            filter: a,
                            enabled: !0
                        })
                    }), G = b.sortBy(G, "filter")
                },
                J = function() {
                    var b = a(this);
                    i = b, b.popover({
                        html: !0,
                        placement: "auto",
                        trigger: "manual",
                        container: "body",
                        template: '<div class="popover filter-results-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                        viewport: "#sidebarContainer",
                        sanitize: !1,
                        content: t.render({
                            filters: G,
                            noFilter: !H(),
                            Messages: e
                        })
                    }).on("click", function(a) {
                        a.preventDefault()
                    }), b.popover().on("shown.bs.popover", function() {
                        K(b)
                    }), a(this).popover("toggle")
                },
                K = function(b) {
                    a(".filter-results-popover .filter-popover #okButton").click(L), a(".filter-results-popover .filter-popover #cancelButton").click(M), a(".filter-results-popover .filter-popover input:checkbox#show_all").change(O), a(".filter-results-popover .filter-popover input:checkbox:not(#show_all)").change(N)
                },
                L = function() {
                    a(".filter-popover radio"), b.map(G, function(a) {
                        a.enabled = !1
                    });
                    var c = a(".filter-popover input:checkbox:checked");
                    b.each(c, function(a) {
                        b.each(G, function(b) {
                            b.filter === a.value && (b.enabled = !0)
                        })
                    }), P()
                },
                M = function() {
                    i.popover("destroy")
                },
                N = function() {
                    a(this).is(":checked") || a(".filter-results-popover #show_all:checkbox").prop("checked", !1)
                },
                O = function(b) {
                    var c = a(this);
                    c.is(":checked") ? a(".filter-results-popover :checkbox:not(:checked) ").prop("checked", !0) : a(".filter-results-popover :checkbox:checked ").prop("checked", !1)
                },
                P = function() {
                    var a = [];
                    b.each(G, function(b) {
                        b.enabled && a.push(b.filter)
                    });
                    var c = [];
                    b.each(k.results, function(d) {
                        b.find(a, function(a) {
                            return a === d.type
                        }) && c.push(d)
                    }), b.map(c, function(a, b) {
                        a.index = b + 1
                    }), l = {
                        results: c,
                        total: {
                            start: 1,
                            end: c.length,
                            filtered: c.length === k.results.length ? void 0 : c.length,
                            count: k.results.length
                        }
                    }, v = G, S(1), F()
                },
                Q = function() {
					a.publish(a(this).data("event"), [l.results, {
                        title: u["export"].title,
                        fileName: u["export"].fileName
                    }])
                },
                R = function() {
                    if (w.paging) {
                        var b, c = w.pageSize,
                            d = m.total.start,
                            f = parseInt(a.isNumeric(m.total.filtered) ? m.total.filtered : m.total.count),
                            g = Math.ceil(f / c),
                            h = f ? Math.ceil(d / c) : 0;
                        b = {
                            prevDisabled: h <= 1,
                            nextDisabled: h === g,
                            nextTarget: h + 1,
                            prevTarget: h - 1,
                            pageCount: e.results_list.pageCount.replace("$1", h).replace("$2", g),
                            Messages: e
                        }, a("#results-page-controls", x).html(s.render(b)), a("#results-page-controls li:not(.disabled) a", x).click(U)
                    }
                },
                S = function(a) {
                    if (!l) return {};
                    var b = w.pageSize * (a - 1),
                        c = w.pageSize * a,
                        d = l.results.slice(b, c);
                    m = {
                        results: d,
                        total: {
                            start: b + 1,
                            end: c,
                            filtered: l.total.filtered,
                            count: l.total.count
                        }
                    }
                },
                T = function(a) {
                    S(a), F()
                },
                U = function(b) {
                    T(a(this).data("page-target"))
                },
                V = function(b) {
                    a.publish("beforePopupCreated");
                    var f, g = a(this),
                        h = g.hasClass("selected");
                    D(), h && g.removeClass("selected");
                    var i = a(this).data("index") - 1,
                        j = l.results[i] || l.results[0];
                    "main_map" === w.map.mapName && j.geographicLonLat && !d.containsFeature(d.getMapBounds(w.map.olMap), j) && d.setCurrentMapCentre(w.map.olMap, j.geographicLonLat), f = {
                        element: g,
                        template: q,
                        popoverType: "results",
                        isCarousel: !1,
                        data: j,
                        messages: e,
                        parentComponent: w.parentComponent || "results",
                        urn: l.results[i].id,
                        toggleIn: !1
                    }, n.createContentPopover(f), g.popover().on("hidden.bs.popover", function() {
                        g.removeClass("selected"), h || ea()
                    }), g.popover().on("hide.bs.popover", function() {
                        h = !1
                    }), g.popover().on("show.bs.popover", function() {
                        a(".result.selected", x).removeClass("selected"), g.addClass("selected"), h = !0;
						
                        var b, e = j.parsedGeom,
						
                            f = j.centerLonLat;
                        w.useGeographic && j.geographicLonLat && (f = j.geographicLonLat, e = j.geographicGeom), e.length && (b = w.map.olMap.getView().extent, b && !c.extent.containsCoordinate(b, f) && d.setCurrentMapCentre(w.map.olMap, f), a.publish("highlightFeatures", [w.map.mapName, e]))
                    }), g.popover().on("shown.bs.popover", function() {
                        W(g)
                    }), g.popover("toggle"), a(".results #popUpClose").click(function() {
                        D(), a(".result.selected", x).removeClass("selected")
                    }), a.publish("afterPopupCreated")
                },
                W = function(b) {
                    var c, d = a(".popover"),
                        e = a(".arrow", d),
                        f = d.height(),
                        g = a(".navbar").height() + a(".map-toolbar").height() + 5,
                        h = d.parent().height() - f - 20,
                        i = parseInt(d.css("top"));
                    i > h && (d.css("top", h + "px"), i = h), i < g && (d.css("top", g + "px"), i = g), e && (c = b.offset().top - d.parent().offset().top + b.height() / 2, c < i + 10 || c > i + f - 10 ? e.css("display", "none") : e.css("top", c - i + "px"))
                },
                X = function() {
                    a("#sidebarContainer").on("scroll", function() {
                        D()
                    })
                },
                Y = function() {
                    x.html("")
                },
                Z = function() {
                    v && G !== v && (G = v, P())
                },
                $ = function(a) {
                    var c, f, g, h = a.results,
                        i = {};
                    return i.count = a.results.length, i.start = 1, i.end = i.start + i.count - 1, b.map(h, function(h, j) {
                        return h.index = j + i.start, h.type = h.name || e.result_list.noCollectionType, h.attributes = [], a.geographic_context && (c = a.geographic_context[h.id]), c = c || [h.geometry], c && (h.geographicGeom = d.parseData(c), h.geographicLonLat = d.findCentrePointOfGeometry(c[0])), a.contexts && Object.keys(a.contexts).length && (g = Object.keys(a.contexts)[0], f = a.contexts[g][h.id], f && (c = f)), c && (h.parsedGeom = d.parseData(c), h.centerLonLat = d.findCentrePointOfGeometry(c[0])), b.each(h.properties, function(a, b) {
                            "unset" !== a && null !== a && "" !== a && h.attributes.push({
                                value: a,
                                key: b
                            })
                        }), h
                    }), {
                        results: h,
                        total: i
                    }
                },
                _ = function(a) {
                    var b = 40,
                        c = 40,
                        d = "data:image/svg+xml;charset=utf-8;base64," + btoa(r.render({
                            height: c,
                            width: b,
                            text: a,
                            "class": "info"
                        }));
                    return d
                },
                aa = function(a) {
                    var c = !1,
                        e = a.getGeometry().getCoordinates();
                    b.find(j, function(a) {
                        if (a.centerLonLat && a.centerLonLat[0] === e[0] && a.centerLonLat[1] === e[1]) return n.createPopup(e, {
                            features: [a]
                        }, w.map.olMap, w.map.mapName), c = !0, !0
                    }), d.setContinueSelecting(!c)
                },
                ba = function() {
                    h && ca();
                    var e, f = new c.source.Vector({}),
                        g = w.map.olMap,
                        i = "Results Markers";
                    f.layer = i, h = new c.layer.Vector({
                        name: i,
                        source: f
                    }), g.addLayer(h), a.publish("registerSpecialSelectionHandler", [i, aa]), b.each(m.results, function(a) {
                        if (void 0 !== a.geographicLonLat) {
                            var b = a.geographicLonLat,
                                d = new c.Feature({
                                    geometry: new c.geom.Point(b)
                                });
                            e = new c.style.Style({
                                image: new c.style.Icon({
                                    src: _(a.index),
                                    size: [40, 40],
                                    imgSize: [40, 40]
                                }),
                                radius: 40
                            }), d.setStyle(e), a.marker = d, f.addFeature(d)
                        }
						console.log(d,g,h,"------------")
                    }), h.getSource().getFeatures().length > 0 && d.gotoExtentsOfLayer(g, h)
                },
                ca = function() {
                    ea(), h && (w.map.olMap.removeLayer(h), h = void 0)
                },
                da = function() {
                    return j
                },
                ea = function() {
                    a.publish("clearHighlight", [w.map.mapName])
                },
                fa = function() {
                    a(".result", x).popover("destroy"), i ? i.popover("destroy") : "", h && ca(), Y()
                },
                ga = function() {
                    var c = [];
                    return o || a.publish("getAvailableExports", [{
                        callback: function(a) {
                            o = a
                        }
                    }]), b.each(o, function(a) {
                        var d = !1;
                        b.each(a.availableTo, function(a) {
                            a.component === w.parentComponent ? "string" != typeof a.type || "all" !== a.type && a.type !== w.parentComponentResultType ? b.find(a.type, function(a) {
                                return a === w.parentComponentResultType
                            }) && (d = !0) : d = !0 : "all" === a.component && (d = !0)
                        }), d && c.push({
                            pubEvent: a.pubEvent,
                            name: a.publishName
                        })
                    }), c
                };
            C(), X();
            var ha = {
                renderResults: E,
                displayMarkers: ba,
                clearMarkers: ca,
                clear: fa,
                getResults: da
            };
            return ha.__TEST_ONLY__ = {
                handleResultClicks: V,
                renderResults: E,
                getPageData: S,
                processResultsForRender: $,
                createPageControls: R,
                displayMarkers: ba,
                doFilter: P,
                okFilterClickHandler: L,
                selectAllFilterClickHandler: O,
                handleFilterClick: J,
                addFilterButtonHandler: K,
                getExportOptionsList: ga,
                getSelector: function() {
                    return x
                },
                clearMarkers: ca,
                setSelector: function(a) {
                    x = a
                },
                setData: function(a) {
                    k = a
                },
                getFilterData: function() {
                    return l
                },
                setFilterData: function(a) {
                    l = a
                },
                setOlMap: function(a) {
                    w.map.olMap = a
                },
                getMap: function() {
                    return w.map.olMap
                },
                getMapName: function() {
                    return w.map.mapName
                },
                setPageTemplate: function(a) {
                    s = a
                },
                setCardTemplate: function(a) {
                    p = a
                },
                setResults: function(a) {
                    j = a
                },
                getMarkers: function() {
                    return h
                },
                setMarkers: function(a) {
                    h = a
                },
                setOptions: function(a) {
                    w = a
                },
                setFilterButton: function(a) {
                    i = a
                },
                setFilterOptions: function(a) {
                    G = a
                },
                getFilterOptions: function() {
                    return G
                },
                setPageData: function(a) {
                    m = a
                },
                setAvailableExports: function(a) {
                    o = a
                }
            }, ha
        },
        w = function(a) {
            return new v(b.extend({}, u, a))
        },
        x = {
            getNewResultsList: w
        };
    return x.__TEST_ONLY__ = {
        getNewResultsList: w
    }, x
});