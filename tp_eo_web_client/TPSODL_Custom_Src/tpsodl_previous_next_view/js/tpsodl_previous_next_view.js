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
		$.subscribe("mapInitialised", map)
	},
	map = function (a, b) {
		mapRef = b,
		mapName = a,
		init()
	};

	var history = [];
	var history_now = -1;
	var click = false;
	var delay = 350; 

	mapInit();

  
	var initialise = function () {
		$("#next_view").css({
			"color": "#ccc"
		});
		$("#previous_view").css({
			"color": "#ccc"
		});
		var enableDisablePrevAndNext = function(){
			if(history_now >= 0 && (history_now == history.length - 1)){
				$("#previous_view").css({
					"color": "midnightblue"
				});
				$("#next_view").css({
					"color": "#ccc"
				});
			}else if(history_now != 0 && (history_now != history.length - 1) && history.length >0){
				$("#previous_view").css({
					"color": "midnightblue"
				});
				$("#next_view").css({
					"color": "midnightblue"
				});
			}else if(history_now >= 0 && (history_now != history.length - 1)){
				$("#previous_view").css({
					"color": "#ccc"
				});
				$("#next_view").css({
					"color": "midnightblue"
				});
			}
		}
		mapRef.on('moveend', function () {
			if(!click) enableDisablePrevAndNext();
			
			if (click) return;
			history.push({
				center: mapRef.getView().getCenter(), 
				resolution: mapRef.getView().getResolution()
			});
			if(!click) history_now++;
      });
	  
		$("#next_view").click(function () {
			if (history_now >= 0 && history_now < (history.length-1)) {
				click = true;
				history_now++;
				mapRef.getView().setCenter(history[history_now].center);
				mapRef.getView().setResolution(history[history_now].resolution);
				enableDisablePrevAndNext();
				setTimeout(function () {
					click = false;
				}, delay);
			}			
		})
		$("#previous_view").click(function () {
			if (history_now > 0) {
				click = true;
				history_now--;
				mapRef.getView().setCenter(history[history_now].center);
				mapRef.getView().setResolution(history[history_now].resolution);
				enableDisablePrevAndNext();
				setTimeout(function () {
					click = false;
				}, delay);
			}	
		})
		$("#clear_map").click(function () {
			
			mapRef.getOverlays().getArray().slice(0).forEach(function(overlay) {
				mapRef.removeOverlay(overlay);
			});
			 tpsodl_urn=selectedIndividualFeatureOnMap=trailURN=req_urns=undefined
			 $.publish("clearHighlight", ["main_map"]);
  		       $.publish("clearPopovers");
				
		})
		
		$("#osm_view").click(function () {
			osmFlag = !osmFlag;
			osm_tileLayer.setVisible(osmFlag);
		})
		
		$("#shared_path").click(function () {
			window.open("https://gis.tpsouthernodisha.com:8080/webgis/SLD/UserGuide.pdf");
		})
	}

});
