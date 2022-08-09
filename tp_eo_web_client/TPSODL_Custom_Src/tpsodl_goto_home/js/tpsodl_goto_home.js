define(["jquery", "underscore", "i18n!nls/messages", "hogan", 'map-loader', 'map-helper','map-google',"OpenLayers3", "proj4"], function ($, _, messages, hogan, mapdsConfig, MapHelper, google,OpenLayers3,proj4) {
	"use strict";
	var mapRef,
	mapName,
	n,
	o,
	p = !1,
	q = !1,
	init = function () {
		initialise();
	},
	mapInit = function () {
		$('#home_view').css('display','inline')
		$.subscribe("mapInitialised", map)
	},
	map = function (a, b) {
		mapRef = b,
		mapName = a,
		init()
	};
	mapInit();
	var initialise = function () {
		$("#home_view").click(function () {
			var mapProj = MapHelper.getMapProjection();
			var center = proj4('EPSG:4326', mapProj.name, [mapdsConfig.MapOptions.CentreLong, mapdsConfig.MapOptions.CentreLat])
			mapRef.getView().setCenter(center);
			mapRef.getView().setZoom(mapdsConfig.MapOptions.DefaultZoom);
		})
	}
});
