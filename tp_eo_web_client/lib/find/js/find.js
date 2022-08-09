define(["jquery", "underscore", "results-list", "OpenLayers3", "i18n!viewer/nls/messages", "map-loader", "text!find-partials/find.html", "hogan", "comms", "text!viewer-icons/icon-tip.svg", "map-helper", "proj4", "map-core-component/pubsub", "spinner", "datepicker"], function(e, t, a, n, r, i, o, s, l, c, d, u) {
    "use strict";
    var p, f, g, y, v, m, h, _, b, w, S, C, T, F, q = s.compile(o),
        k = d.getMapProjection(),
        x = {
            query_array: []
        },
        P = [{
            name: "geometry",
            setDefault: !0,
            tooltip: r.find.spatialConstraints.tooltip,
            values: [{
                value: r.find.spatialConstraints.anywhere
            }, {
                value: r.find.spatialConstraints.withinMap
            }, {
                value: r.find.spatialConstraints.withinArea
            }]
        }, {
            name: "within_area",
            placeholder: "No area specified",
            tooltip: "Find area"
        }],
        M = [new n.style.Style({
            fill: new n.style.Fill({
                color: "rgba(0, 0, 255, 0.1)"
            }),
            stroke: new n.style.Stroke({
                color: "#ffcc33",
                width: 2
            }),
            image: new n.style.Circle({
                radius: 7,
                fill: new n.style.Fill({
                    color: "#ffcc33"
                })
            })
        })],
        j = function(e, t) {
            "find" === e && R(t, {
                id: e
            })
        },
        L = function(t) {
            e.publish("enablePopovers")
        },
        O = function(e) {},
        D = function(e, t) {
            v = t, w = e
        },
        N = function(t) {
            e.publish("openSidebarToItem", ["find"]), e("select.geometry_select", f).val(r.find.spatialConstraints.withinArea), Q(!0), e(".within_area_div input", f).val(t.objectType), F = d.parseData([{
                coordinates: t.geometry.coordinates || t.geometry[0].coordinates,
                type: t.geometry.type || t.geometry[0].type
            }]), e(".within_area_div", f).removeClass("has-error"), e(".ol-overlay-container .popover").remove()
        },
        R = function(e) {
            f = e, A()
        },
        A = function() {
            l.getGSSRequest({
                service: "ejb/FindLocal",
                method: "getFindConfiguration"
            }, I, ae)
        },
        I = function(a) {
            if (a.find_configuration) {
                var n = e.extend(!0, {}, V(a.find_configuration));
                t.each(n.search_config, function(e) {
                    "coordinate_find_component" === e.class ? (e.tooltip = "Coordinate", x[e.name] = e, x.query_array.push(e)) : "fields_find_component" === e.class && ($(e), x[e.name] = e, x.query_array.push(e), t.each(e.fields, function(e) {
                        e.values ? e.enumerated = !0 : e.query_type && "date_range" === e.query_type ? (e.dateRangeField = !0, e.fromStr = r.find.dateFieldFrom, e.toStr = r.find.dateFieldTo, e.dateFormat = re()) : e.query_type && "date" === e.query_type ? (e.dateField = !0, e.dateFormat = re()) : e.textField = !0
                    }))
                }), E()
            }
        },
        V = function(a) {
            var n = {},
                r = "search_config";
            if (n = e.extend(!0, {}, a), i.settings) {
                if (n[r] = {}, t.contains(i.settings[r], "all")) return a;
                var o = [];
                i.settings[r] && (t.map(a[r], function(e, a) {
                    t.contains(i.settings[r], e.name) && o.push(e)
                }), n[r] = o)
            } else n = a;
            return n
        },
        $ = function(e) {
            t.each(P, function(t) {
                e.fields ? e.fields.push(t) : e.fields = [t]
            })
        },
        E = function() {
            var n = {
                queries: x.query_array,
                messages: r,
                TipSvg: c,
                footerMessage: r.find.spatialConstraints.withinAreaFooterMessage
            };
            f.append(q.render(n)), t.each(x, function(a, n) {
                "query_array" !== n && (a.$selector = e(".module-body #findOptions #" + a.name + "-query", f), a.fieldObject = {}, t.each(a.fields, function(e) {
                    a.fieldObject[e.name] = e
                }))
            }), g = e(".query-options", f);
            var i = e(".module-body select#queryType", f);
            i.change(te), i.change(), e("button#submit", f).on("click touchend", Y), e("button#cancel", f).on("click touchend", B), e(".query-clear-btn", f).on("click touchend", J);
            var o = re();
            e(".datepicker").datepicker({
                autoclose: !0,
                todayHighlight: !0,
                format: o
            }), T = e(f).find("#find_spinner"), y = e("#find-results", f), S = a.getNewResultsList({
                selector: y,
                paging: !0,
                map: {
                    olMap: v,
                    mapName: w
                },
                parentComponent: "find",
                export: !0,
                filter: !0
            }), H(), G()
        },
        G = function() {
            e(".within_area_div", f).hide();
            var t = e(".within_area_div input", f);
            t.addClass("within_area"), t.attr("disabled", "disabled")
        },
        H = function() {
            e("select.geometry_select", f).on("change", function(t) {
                S && S.clear(), e(this).val() === r.find.spatialConstraints.withinTrail ? (e(".within_area_div", f).hide(), F = void 0, m = void 0, v.removeLayer(_), e.publish("disablePopovers"), "", _ = "", h = new n.source.Vector({}), b = new n.interaction.Draw({
                    source: h,
                    type: "Polygon"
                }), v.addInteraction(b), b.on("drawend", function(e) {
                    m = e.feature.getGeometry().getCoordinates();
                    var t = new n.geom.Polygon(m),
                        a = new n.Feature({
                            name: "Thing",
                            geometry: t,
                            style: new n.style.Style({
                                stroke: new n.style.Stroke({
                                    color: "red"
                                })
                            })
                        }),
                        r = new n.source.Vector({
                            features: [a],
                            wrapX: !1
                        });
                    _ = new n.layer.Vector({
                        source: r,
                        style: M
                    }), v.addLayer(_), v.removeInteraction(b)
                })) : (F = void 0, v.removeInteraction(b), v.removeLayer(_), e.publish("enablePopovers"), e(".within_area_div input", f).val(""), e(".within_area_div", f).removeClass("has-error"), Q(e(this).val() === r.find.spatialConstraints.withinArea))
            })
        },
        Q = function(t) {
            var a = e(".within_area_div", f);
            t ? (e("#find-container footer").show(), a.show()) : (e("#find-container footer").hide(), a.hide())
        },
        Y = function() {
            U()
        },
        B = function() {
            v.removeLayer(p), v.removeLayer(_), v.removeInteraction(b), e.publish("enablePopovers"), e(".coord_lat_long").val("");
            var t = e(".module-body select#queryType", f).val();
            x[t].$selector.find("input").val(""), x[t].$selector.find("select").prop("selectedIndex", 0), S && S.clear(), e("#results-page-controls", f).html(""), e("#find-container footer").hide(), z(), e(".within_area_div", f).hide()
        },
        J = function(t) {
            t.preventDefault(), e(this).parent().parent().find("input,select").val(""), 0 !== e(this).parents(".within_area_div").length && z()
        },
        z = function() {
            F = void 0, e(".within_area_div", f).removeClass("has-error")
        },
        U = function() {
            if (v.removeLayer(p), p = "", "coordinate_query" == e(".module-body select#queryType", f).val()) {
                var a, o = e("#coord_type").val(),
                    s = e(".coord_lat_long").val();
                if ("" == s) e.publish("raiseTempMessage", ["Please provide valid Latitude and longitude values", {
                    messageType: "error"
                }]);
                else {
                    var c = s.split(",");
                    if (0 == c.length || c.length % 2 != 0) return void e.publish("raiseTempMessage", ["Please provide valid Latitude and longitude values", {
                        messageType: "error"
                    }]);
                    var d = [];
                    if ("EPSG:900913" == o) {
                        for (let e = 0, t = 0; e < c.length; e += 2, t++) {
                            a = [Number(c[e + 1]), Number(c[e])];
                            var u = new n.Feature(new n.geom.Point(a));
                            d.push(u)
                        }
                        ie(d)
                    } else {
                        var g = {
                            json: !0,
                            method: "transform_coordinate",
                            source_cs: o,
                            target_cs: "EPSG:900913",
                            coord: s
                        };
                        l.getGSSRequest(g, function(e) {
                            a = e.transformed_coords, t.each(a, function(e) {
                                var t = new n.Feature(new n.geom.Point([Number(e[0]), Number(e[1])]));
                                d.push(t)
                            }), ie(d)
                        }, function(t) {
                            e.publish("raiseTempMessage", ["Wrong values", {
                                messageType: "error"
                            }])
                        })
                    }
                }
            } else {
                var y = e(".module-body select#queryType", f).val(),
                    m = x[y].$selector.find('select[data-name="geometry"]').val(),
                    h = Z();
                g = {
                    query_name: e(".module-body select#queryType", f).val(),
                    query_parameters: X(),
                    json: !0,
                    crs: k.name,
                    result_type: "all",
                    feature_start: 1,
                    ace_visibility_tag: i.tags.results || "web_export"
                };
                void 0 !== h && (g.geometry = h), e(".within_area_div", f).hasClass("has-error") && m == r.find.spatialConstraints.withinArea ? e.publish("raiseTempMessage", [r.find.spatialConstraints.noSearchAreaDefined, {
                    messageType: "warning"
                }]) : (oe(), l.postGSSRequest(g, "?method=find", ee, ae))
            }
        },
        X = function() {
            var a = e(".module-body select#queryType", f).val(),
                n = x[a].$selector.find("input,select"),
                r = {};
            return t.each(n, function(t) {
                var a = e(t),
                    n = a.val(),
                    i = a.data("name");
                a.hasClass("datepicker-from") ? r[i] = K(a) : a.hasClass("datepicker") && !a.hasClass("datepicker-to") ? r[i] = W(a) : "geometry" === i || "within_area" === i || a.hasClass("datepicker") || (r[i] = n || "")
            }), JSON.stringify(r)
        },
        W = function(e) {
            var t = e.datepicker("getDate"),
                a = ne(t);
            return "" !== e.val() && "" !== a ? a : ""
        },
        K = function(t) {
            var a, n, i = t.parent().children(".datepicker-to"),
                o = i.val();
            "" !== t.val() && (a = t.datepicker("getDate")), "" !== o && (n = i.datepicker("getDate")), "" !== t.val() && "" !== o && a > n && e.publish("raiseTempMessage", [r.find.invalidOrderOfDates, {
                messageType: "error"
            }]);
            var s = ne(a),
                l = ne(n);
            return "" === s && "" === l ? "" : "" !== s && "" === l ? s.concat("-") : "" === s && "" !== l ? "-".concat(l) : s !== l ? s.concat("-").concat(l) : s
        },
        Z = function() {
            var t, a = e(".module-body select#queryType", f).val(),
                i = x[a].$selector.find('select[data-name="geometry"]').val();
            if (i === r.find.spatialConstraints.withinMap) {
                var o = v.getView().calculateExtent(v.getSize()),
                    s = n.geom.Polygon.fromExtent(o),
                    l = new n.Feature(s);
                (t = d.getFormattedFeatures([l], {
                    externalProjection: n.proj.get(k.name)
                })) && (t = t.replace("null", "{}"))
            } else if (i === r.find.spatialConstraints.withinArea) {
                var c = e(".within_area_div", f);
                void 0 === F ? c.addClass("has-error") : (c.removeClass("has-error"), (t = d.getFormattedFeatures(F, {
                    externalProjection: n.proj.get(k.name)
                })) && (t = t.replace("null", "{}")))
            } else i === r.find.spatialConstraints.withinTrail && null != m && (F = d.parseData([{
                coordinates: m,
                type: "Polygon"
            }]), (t = d.getFormattedFeatures(F, {
                externalProjection: n.proj.get(k.name)
            })) && (t = t.replace("null", "{}")));
            return t
        },
        ee = function(t) {
            S.renderResults(t.features.features, {
                showMarkers: !0,
                geographic_context: t.geographic_context,
                showNumberBadges: !0,
                resultType: e(".module-body select#queryType", f).val(),
                export: {
                    title: r.find.exportFileTitle,
                    fileName: r.find.exportFileName
                }
            }), C = t, se()
        },
        te = function(t) {
            var a = e(this).val();
            if ("coordinate_query" == a) {
                e("#coordinate").css("display", "inline");
                var n = e("#coord_type");
                n.empty(), n.prop("selectedIndex", 0), e.getJSON("./TPSODL_Custom_Src/config/coordinate_values.json", function(t) {
                    e.each(t, function(t, a) {
                        n.append(e("<option></option>").attr("value", a.value).text(a.name))
                    })
                }), g.hide(), x[a].$selector.show(), B(), e(".within_area_div", f).hide()
            } else e("#coordinate").css("display", "none"), "tpsodl_consumer_query" == a ? e(".geometry_div").css("display", "none") : e(".geometry_div").css("display", "inline"), g.hide(), x[a].$selector.show(), B(), e(".within_area_div", f).hide()
        },
        ae = function(t, a, n) {
            e.publish("raiseStickyMessage", [r.find.timeOut, {
                messageType: "error",
                errorMessage: t.responseText
            }]), se()
        },
        ne = function(e) {
            var t = "";
            return void 0 !== e && (t = "".concat(e.getFullYear()).concat("/").concat(e.getMonth() + 1).concat("/").concat(e.getDate())), t
        },
        re = function() {
            var e = new Date(2017, 3, 12),
                t = ("0" + (e.getMonth() + 1)).slice(-2),
                a = e.getFullYear(),
                n = e.getDate(),
                r = navigator.language || navigator.userLanguage;
            return e.toLocaleString(r, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).replace(a, "yyyy").replace(t, "mm").replace(n, "dd")
        },
        ie = function(e) {
            var t = new n.style.Style({
                    image: new n.style.Icon({
                        anchor: [.5, 46],
                        anchorXUnits: "fraction",
                        anchorYUnits: "pixels",
                        opacity: .75,
                        src: "./TPSODL_Custom_Src/img/tpsodl_custom_pin.png"
                    })
                }),
                a = new n.source.Vector({
                    features: e
                });
            p = new n.layer.Vector({
                source: a,
                style: t
            }), v.addLayer(p), v.getView().fit(a.getExtent(), v.getSize())
        },
        oe = function() {
            T && (T.spin(), e(e("#find-card #submit")[0]).attr("disabled", "disabled"))
        },
        se = function() {
            T && (T.spin(!1), e(e("#find-card #submit")[0]).removeAttr("disabled"))
        };
    e.subscribe("gotoSidebar", O), e.subscribe("leavingSidebar", L), e.subscribe("mapInitialised", D), e.subscribe("setFindArea", N), e.subscribe("sidebarContainerReady", j), e.subscribe("popoverButtonVisibilityControl", function(t, a, n) {
        if ("popoverButtonSetFindArea" === t[0].id && n) {
            for (var r = !1, o = n.length || 1, s = 0; s < o; s++) {
                var l = n.type || n[s].type;
                "Polygon" !== l && "MultiPolygon" !== l || (r = !0)
            }
            i.isAvailable("find") && r ? e(t[0]).css("display", "inline") : e(t[0]).css("display", "none")
        }
    });
    var le = {
        getFindResult: function() {
            return C
        }
    };
    return le.__TEST_ONLY__ = {
        clearFieldHandler: J,
        getMap: function() {
            return v
        },
        getMapName: function() {
            return w
        },
        initialise: R,
        getCardSelector: function() {
            return f
        },
        setCardSelector: function(e) {
            f = e
        },
        getQueriesCallback: I,
        getSearchResult: U,
        getQueriesObject: function() {
            return x
        },
        setQueriesObject: function(e) {
            x = e
        },
        getSearchTermsJSON: X,
        searchHandler: Y,
        errorCallback: ae,
        setResultsList: function(e) {
            S = e
        },
        getSearchResultCallback: ee,
        cancelHandler: B,
        setQueryOptionsSelector: function(e) {
            g = e
        },
        querySelectChange: te,
        setConsole: function(e) {
            console = e
        },
        setSpinner: function(e) {
            T = e
        },
        getFindResult: function() {
            return C
        }
    }, le
});