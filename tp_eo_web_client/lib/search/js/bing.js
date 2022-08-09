/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery","OpenLayers3","map-loader","map-helper","map-core-component/pubsub"],function(a,b,c,d){"use strict";var e,f,g={},h=1,i=0,j=3,k=2,l=navigator.language||navigator.userLanguage,m=/^http:|https:/,n="http://dev.virtualearth.net/REST/v1/Locations".replace(m,location.protocol),o=function(){a.subscribe("mapInitialised",p)},p=function(a,b){e=b,f=d.mapProj},q=function(b,d){a.ajax({data:{c:l,key:c.Bing.Key,maxResults:10,q:b},async:!0,dataType:"jsonp",jsonp:"jsonp",url:n,success:function(b){var c=b.resourceSets[0].resources;d(a.map(c,function(a){return g[a.name]=a,{value:a.name}}))}})},r=function(a){var b,c=g[a.value].bbox,f=d.transformToMapProjection([c[h],c[i]]),l=d.transformToMapProjection([c[j],c[k]]);b=f.concat(l),d.fitMapToBounds(e,b)},s=function(a){return a=a||{mapName:"default",placeHolderText:"Address Search"},{icon:"icon-map-marker",placeholderText:a.placeHolderText||"",searchOptions:{isFaceted:!1,mapNames:[a.mapName],positionElementID:"searchSubmitBtn",source:q,type:"custom",viewItemCallback:r,highlighter:function(a){var b=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return a.replace(new RegExp("("+b+")","ig"),function(a,b){return"<strong>"+b+"</strong>"})}}}},t=function(b,d,e){a.ajax({data:{c:l,key:c.Bing.Key},async:!0,dataType:"jsonp",jsonp:"jsonp",url:n+"/"+b+","+d,success:function(a){e(a.resourceSets[0].resources[0].name,a.resourceSets[0])}})};o();var u={reverseGeocode:t,getDefaultContext:s};return u.__TEST_ONLY__={setMap:p,getMap:function(){return e},searchAddresses:q,gotoAddressCallback:r},u});