/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery","underscore","map-helper","map-core-component/pubsub"],function(a,b,c){"use strict";var d,e,f=/\/map\/([-]*\d*.\d*),([-]*\d*.\d*),(\d*)z/,g=/\/asset\/([^\/]*)/,h=[0,0],i=16,j=!1,k=function(){a.subscribe("mapInitialised",function(a,b){d=b,e=a,d.on("moveend",l),window.addEventListener("popstate",m),""!==location.hash&&m()}),a.subscribe("popoverOnAsset",function(a){var b,c=location.hash.substring(1),d="/asset/"+a;d=f.test(c)?c.replace(f,d):c+d,b=location.pathname+"#"+d,d!==location.hash&&g.test(d)&&history.pushState(null,null,b)}),a.subscribe("popoverCleared",function(){var a=location.hash.replace(g,""),b=location.pathname+a;a!==location.hash&&history.pushState(null,null,b)})},l=function(a){var b,e,g=c.transformToLonLat(c.getCurrentMapCentre(d)),k=location.hash.substring(1),l=c.getCurrentZoomLevel();g.lat=g.lat||g[1],g.lon=g.lon||g[0],b="/map/"+g.lat.toFixed(6)+","+g.lon.toFixed(6)+","+l+"z",b=f.test(k)?k.replace(f,b):k+b,e=location.pathname+"#"+b,j=n(h,g,d,i,l),b===location.hash||!f.test(b)||!j&&f.test(location.hash)||(history.pushState(null,null,e),i=l,h=g)},m=function(b){if(f.test(location.hash)){var h=f.exec(location.hash),i=c.transformToMapProjection([h[2],h[1]]),j=h[3];c.setCurrentMapCentreAndZoom(d,i,j)}g.test(location.hash)&&a.publish("gotoAsset",[g.exec(location.hash)[1],e])},n=function(a,b,d,e,f){if(f!==e)return!0;var g=c.getMapBounds(d),h=c.transformToLonLat([g[0],g[1]]),i=c.transformToLonLat([g[2],g[3]]),j=Math.abs(h[0]-i[0])/10,k=Math.abs(i[1]-h[1])/10,l=Math.abs(a.lon-b.lon),m=Math.abs(a.lat-b.lat);return l>j||m>k};k();var o={};return o.__TEST_ONLY__={moveEndEvent:l,backButton:m,isSignificantMove:n,setIsSignificant:function(a){n=function(){return a}}},o});