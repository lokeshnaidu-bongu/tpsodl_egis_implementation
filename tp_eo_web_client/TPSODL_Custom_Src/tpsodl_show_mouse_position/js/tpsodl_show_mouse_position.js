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
        },
        map = function(a, b) {
            mapRef = b,
                mapName = a,
                init()
        };
    mapInit();
    var LatLngFormat = function(dgts) {
        return (
            function(coord1) {
                var coord2 = [coord1[1], coord1[0]];
                return OpenLayers3.coordinate.toStringXY(coord2, dgts);
            });
    }

    var initialise = function() {
        var mousePositionControl = new OpenLayers3.control.MousePosition({
            coordinateFormat: LatLngFormat(4),
            projection: 'EPSG:4326',
            className: 'custom-mouse-position',
            target: document.getElementById('mouse-position'),
            undefinedHTML: '&nbsp;'
        });
        mousePositionControl.setMap(mapRef);

        var projectionSelect = $('#projection');
        projectionSelect.on('change', function() {
            mousePositionControl.setProjection(OpenLayers3.proj.get(this.value));
        });
        projectionSelect.val(mousePositionControl.getProjection().getCode());

        var precisionInput = $('#precision');
        precisionInput.on('change', function() {

            var format = LatLngFormat(this.valueAsNumber);
            mousePositionControl.setCoordinateFormat(format);
        });

    }
});