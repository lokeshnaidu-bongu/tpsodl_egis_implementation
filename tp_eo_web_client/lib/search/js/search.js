/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery", "underscore", "i18n!nls/messages", "map-loader", "map-helper", "asset-search", "address-search/google", "address-search/osm", "address-search/bing", "map-google", "hogan", "map-core-component/pubsub"], function(a, b, c, d, e, f, g, h, i, j, k) {
    "use strict";
    var l, m, n = [],
        o = {
            Google: g,
            OSM: h,
            Bing: i
        },
        p = o[d.AddressSearch] || g,
        q = function() {
            a.subscribe("getReverseGeocodeResult", u)
        },
        r = function(a) {
            return a = a || {
                mapName: "default"
            }, l = a.olMap || l, m = {
                icon: "icon-ico_map_lg",
                placeholderText: c.assetSearchBoxHint,
                searchOptions: {
                    olMap: l,
                    isFaceted: !0,
                    mapNames: [a.mapName],
                    offsetPosY: 20,
                    positionElementID: "searchSubmitBtn",
                    source: a.searchFunction || f.searchAssetIndex,
                    topResultLabel: c.topResultLabel,
                    type: "custom",
                    viewItemCallback: a.selectFunction || f.gotoAsset,
                    highlighter: function(a) {
                        return a.value
                    },
                    updater: function(a) {
                        return a.replace(/<(\/|)strong>/gi, "")
                    }
                }
            }
        },
        s = function(a) {
            return n = {}, n.asset = m, n.address = p.getDefaultContext({
                olMap: l,
                mapName: a,
                placeHolderText: c.addressSearchBoxHint
            }), n
        },
        t = function(a, b, c) {
            p.reverseGeocode(a, b, c)
        },
        u = function(a) {
            l && (a = b.extend({
                map: l,
                lonLat: e.transformToLonLat(e.getCurrentMapCentre(l)),
                callback: function(a, b) {
                    console.log("No Callback defined for geocode: " + a, b)
                }
            }, a), t(a.lonLat[1], a.lonLat[0], a.callback))
        };
    q();
    var v = {
        setupAssetSearchContext: r,
        getContexts: s,
        getReverseGeocode: t,
        setOlMap: function(a) {
            l = a
        }
    };
    return v
});