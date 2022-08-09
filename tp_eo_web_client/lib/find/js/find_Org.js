/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["date-helper", "jquery", "underscore", "results-list", "OpenLayers3", "i18n!viewer/nls/messages", "map-loader", "text!find-partials/find.html", "hogan", "comms", "text!viewer-icons/icon-tip.svg", "map-helper", "map-core-component/pubsub", "spinner", "datepicker"], function(a, b, c, d, e, f, g, h, i, j, k, l) {
    "use strict";
    var m, n, o, p, q, r, s, t, u, v = i.compile(h),
        w = "find",
        x = l.getMapProjection(),
        y = {
            query_array: []
        },
        z = [{
            name: "geometry",
            setDefault: !0,
            tooltip: f.find.spatialConstraints.tooltip,
            values: [{
                value: f.find.spatialConstraints.anywhere
            }, {
                value: f.find.spatialConstraints.withinMap
            }, {
                value: f.find.spatialConstraints.withinArea
            }]
        }, {
            name: "within_area",
            placeholder: "No area specified",
            tooltip: "Find area"
        }],
        A = function() {
            b.subscribe("gotoSidebar", E), b.subscribe("leavingSidebar", D), b.subscribe("mapInitialised", F), b.subscribe("setFindArea", G), b.subscribe("sidebarContainerReady", C), b.subscribe("popoverButtonVisibilityControl", B)
        },
        B = function(a, c, d) {
            if ("popoverButtonSetFindArea" === a[0].id && d) {
                var e = !1,
                    f = d.length || 0,
                    h = d.type || d.featureGeometryType;
                if ("Polygon" === h || "MultiPolygon" === h) e = !0;
                else
                    for (var i = 0; i < f; i++) h = d[i].type || d[i].featureGeometryType, "Polygon" !== h && "MultiPolygon" !== h || (e = !0);
                g.isAvailable(w) && e ? b(a[0]).css("display", "inline") : b(a[0]).css("display", "none")
            }
        },
        C = function(a, b) {
            a === w && H(b, {
                id: a
            })
        },
        D = function(a) {},
        E = function(a) {},
        F = function(a, b) {
            p = b, q = a
        },
        G = function(a) {
            b.publish("openSidebarToItem", [w]), b("select.geometry_select", m).val(f.find.spatialConstraints.withinArea), P(!0), b(".within_area_div input", m).val(a.objectType), u = l.parseData([{
                coordinates: a.geometry.coordinates || a.geometry[0].coordinates,
                type: a.geometry.type || a.geometry[0].type
            }]), b(".within_area_div", m).removeClass("has-error"), b(".ol-overlay-container .popover").remove()
        },
        H = function(a) {
            m = a, I()
        },
        I = function() {
            var a = {
                service: "ejb/FindLocal",
                method: "getFindConfiguration"
            };
            j.getGSSRequest(a, J, _)
        },
        J = function(a) {
            if (a.find_configuration) {
                var d = b.extend(!0, {}, K(a.find_configuration));
                c.each(d.search_config, function(a) {
					if (query["class"] === "coordinate_find_component") {
						query.tooltip = "Coordinate";
						queries[query.name] = query;
						queries.query_array.push(query);
					}else{
                    "fields_find_component" === a["class"] && (L(a), y[a.name] = a, y.query_array.push(a), c.each(a.fields, function(a) {
                        a.values ? a.enumerated = !0 : a.query_type && "date_range" === a.query_type ? (a.dateRangeField = !0, a.fromStr = f.find.dateFieldFrom, a.toStr = f.find.dateFieldTo, a.dateFormat = ba()) : a.query_type && "date" === a.query_type ? (a.dateField = !0, a.dateFormat = ba()) : a.textField = !0
                    }))}
                }), M()
            }
        },
        K = function(a) {
            var d = {},
                e = "search_config";
            if (d = b.extend(!0, {}, a), g.settings) {
                if (d[e] = {}, c.contains(g.settings[e], "all")) return a;
                var f = [];
                g.settings[e] && (c.map(a[e], function(a, b) {
                    c.contains(g.settings[e], a.name) && f.push(a)
                }), d[e] = f)
            } else d = a;
            return d
        },
        L = function(a) {
            c.each(z, function(b) {
                a.fields ? a.fields.push(b) : a.fields = [b]
            })
        },
        M = function() {
            var a = {
                queries: y.query_array,
                messages: f,
                TipSvg: k,
                footerMessage: f.find.spatialConstraints.withinAreaFooterMessage
            };
            m.append(v.render(a)), c.each(y, function(a, d) {
                "query_array" !== d && (a.$selector = b(".module-body #findOptions #" + a.name + "-query", m), a.fieldObject = {}, c.each(a.fields, function(b) {
                    a.fieldObject[b.name] = b
                }))
            }), n = b(".query-options", m);
            var e = b(".module-body select#queryType", m);
            e.change($), e.change(), b("button#submit", m).on("click touchend", Q), b("button#cancel", m).on("click touchend", R), b(".query-clear-btn", m).on("click touchend", S);
            var g = ba();
            b(".datepicker").datepicker({
                autoclose: !0,
                todayHighlight: !0,
                format: g,
                container: "#find-container"
            }), t = b(m).find("#find_spinner"), o = b("#find-results", m), r = d.getNewResultsList({
                selector: o,
                paging: !0,
                map: {
                    olMap: p,
                    mapName: q
                },
                parentComponent: w,
                "export": !0,
                filter: !0
            }), O(), N()
        },
        N = function() {
            b(".within_area_div", m).hide();
            var a = b(".within_area_div input", m);
            a.addClass("within_area"), a.attr("disabled", "disabled")
        },
        O = function() {
            b("select.geometry_select", m).on("change", function(a) {
                b(".within_area_div", m).removeClass("has-error"), P(b(this).val() === f.find.spatialConstraints.withinArea)
            })
        },
        P = function(a) {
            var c = b(".within_area_div", m);
            a ? (b("#find-container footer").show(), c.show()) : (b("#find-container footer").hide(), c.hide())
        },
        Q = function() {
            U()
        },
        R = function() {
            var a = b(".module-body select#queryType", m).val();
            y[a].$selector.find("input").val(""), y[a].$selector.find("select").prop("selectedIndex", 0), r && r.clear(), b("#results-page-controls", m).html(""), b("#find-container footer").hide(), T(), b(".within_area_div", m).hide()
        },
        S = function(a) {
            a.preventDefault(), b(this).parent().parent().find("input,select").val(""), 0 !== b(this).parents(".within_area_div").length && T()
        },
        T = function() {
            u = void 0, b(".within_area_div", m).removeClass("has-error")
        },
        U = function() {
            var a = Y(),
                c = {
                    query_name: b(".module-body select#queryType", m).val(),
                    query_parameters: V(),
                    json: !0,
                    crs: x.name,
                    result_type: "all",
                    feature_start: 1,
                    ace_visibility_tag: g.tags.results || "web_export"
                };
            void 0 !== a && (c.geometry = a), b(".within_area_div", m).hasClass("has-error") ? b.publish("raiseTempMessage", [f.find.spatialConstraints.noSearchAreaDefined, {
                messageType: "warning"
            }]) : (ca(), j.postGSSRequest(c, "?service=ejb%2FFindLocal&method=find", Z, _))
        },
        V = function() {
            var a = b(".module-body select#queryType", m).val(),
                d = y[a].$selector.find("input,select"),
                e = {};
            return c.each(d, function(a) {
                var c = b(a),
                    d = c.val(),
                    f = c.data("name");
                c.hasClass("datepicker-from") ? e[f] = X(c) : c.hasClass("datepicker") && !c.hasClass("datepicker-to") ? e[f] = W(c) : "geometry" === f || "within_area" === f || c.hasClass("datepicker") || (e[f] = d || "")
            }), JSON.stringify(e)
        },
        W = function(a) {
            var b = a.datepicker("getDate"),
                c = aa(b);
            return "" !== a.val() && "" !== c ? c : ""
        },
        X = function(a) {
            var c, d, e = a.parent().children(".datepicker-to"),
                g = e.val();
            "" !== a.val() && (c = a.datepicker("getDate")), "" !== g && (d = e.datepicker("getDate")), "" !== a.val() && "" !== g && c > d && b.publish("raiseTempMessage", [f.find.invalidOrderOfDates, {
                messageType: "error"
            }]);
            var h = aa(c),
                i = aa(d);
            return "" === h && "" === i ? "" : "" !== h && "" === i ? h.concat("-") : "" === h && "" !== i ? "-".concat(i) : h !== i ? h.concat("-").concat(i) : h
        },
        Y = function() {
            var a, c = b(".module-body select#queryType", m).val(),
                d = y[c].$selector.find('select[data-name="geometry"]').val();
            if (d === f.find.spatialConstraints.withinMap) {
                var g = p.getView().calculateExtent(p.getSize()),
                    h = e.geom.Polygon.fromExtent(g),
                    i = new e.Feature(h);
                a = l.getFormattedFeatures([i], {
                    externalProjection: e.proj.get(x.name)
                }), a && (a = a.replace("null", "{}"))
            } else if (d === f.find.spatialConstraints.withinArea) {
                var j = b(".within_area_div", m);
                void 0 === u ? j.addClass("has-error") : (j.removeClass("has-error"), a = l.getFormattedFeatures(u, {
                    externalProjection: e.proj.get(x.name)
                }), a && (a = a.replace("null", "{}")))
            }
            return a
        },
        Z = function(c) {
            c = JSON.parse(JSON.stringify(c, a.formatISODateString)), r.renderResults(c.features.features, {
                showMarkers: !0,
                geographic_context: c.geographic_context,
                showNumberBadges: !0,
                resultType: b(".module-body select#queryType", m).val(),
                "export": {
                    title: f.find.exportFileTitle,
                    fileName: f.find.exportFileName
                }
            }), s = c, da()
        },
        $ = function(a) {
            var c = b(this).val();
            n.hide(), y[c].$selector.show(), R(), b(".within_area_div", m).hide()
        },
        _ = function(a, c, d) {
            console.log(a, c, d), b.publish("raiseStickyMessage", [f.find.timeOut, {
                messageType: "error",
                errorMessage: a.responseText
            }]), da()
        },
        aa = function(a) {
            var b = "";
            return a && (b = "".concat(a.getFullYear()).concat("/").concat(a.getMonth() + 1).concat("/").concat(a.getDate())), b
        },
        ba = function() {
            var a = new Date(2017, 3, 12),
                b = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                },
                c = ("0" + (a.getMonth() + 1)).slice(-2),
                d = a.getFullYear(),
                e = a.getDate(),
                f = navigator.language || navigator.userLanguage,
                g = a.toLocaleString(f, b);
            return g.replace(d, "yyyy").replace(c, "mm").replace(e, "dd")
        },
        ca = function() {
            t && (t.spin(), b(b("#find-card #submit")[0]).attr("disabled", "disabled"))
        },
        da = function() {
            t && (t.spin(!1), b(b("#find-card #submit")[0]).removeAttr("disabled"))
        };
    A();
    var ea = {
        getFindResult: function() {
            return s
        }
    };
    return ea.__TEST_ONLY__ = {
        clearFieldHandler: S,
        getMap: function() {
            return p
        },
        getMapName: function() {
            return q
        },
        initialise: H,
        getCardSelector: function() {
            return m
        },
        setCardSelector: function(a) {
            m = a
        },
        getQueriesCallback: J,
        getSearchResult: U,
        getQueriesObject: function() {
            return y
        },
        setQueriesObject: function(a) {
            y = a
        },
        getSearchTermsJSON: V,
        searchHandler: Q,
        errorCallback: _,
        setResultsList: function(a) {
            r = a
        },
        getSearchResultCallback: Z,
        cancelHandler: R,
        setQueryOptionsSelector: function(a) {
            n = a
        },
        querySelectChange: $,
        setConsole: function(a) {
            console = a
        },
        setSpinner: function(a) {
            t = a
        },
        getFindResult: function() {
            return s
        }
    }, ea
});