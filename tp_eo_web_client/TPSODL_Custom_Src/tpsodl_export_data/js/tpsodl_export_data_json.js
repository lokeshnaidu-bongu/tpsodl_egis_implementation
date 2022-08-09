define([
        'jquery',
        'underscore',
        'proj4',
        'i18n!viewer/nls/messages',
        'download',
        'OpenLayers3',
        'map-core-component/pubsub'
    ],
    function CustomJSONExport($, _, proj4, Messages, Download, OpenLayers ) {
        'use strict';
        var fileExtension = 'json',
            defaultOptions = {
                title: Messages.export.defaultTitle,
                fileName: Messages.export.defaultFileName,
                fileExtension: fileExtension,
                type: Download.fileTypes.JSON
            };

        var exportRecords = function exportRecords(data, options) {
            var opts = _.extend({
                date: new Date()
            }, defaultOptions, options);

            opts.fileName = opts.fileName + fileExtension;
            opts.data = genereateJSON(data);

            $.publish('clientItemReadyForDownload', [opts]);
        };

        $.subscribe('exportRecordsCustomJSON', exportRecords);

        var genereateJSON = function(a) {

            var wgs_proj = proj4('EPSG:3857');
            var lat_long_proj = proj4('EPSG:4326');
			var start_json = {"crs": {"type": "name","properties": {"name": "EPSG:4326"}},"type": "FeatureCollection","features": []};
			var json_data = JSON.stringify(start_json,null,'\t')
			json_data = json_data.substring(0, json_data.length -3)+'\n\t'
			var myrec = {};
			console.log(json_data)
			var loc_data,coords;
			console.log("---- Generating JSON -----")
			console.log(a)
			
			_.each(a, function(a_rec){
				coords=[];
				loc_data = a_rec.parsedGeom[0].T.geometry.A
				// loc_data = a_rec.geometry.coordinates
				// console.log(loc_data.length)
							
				if (loc_data.length > 2){
					// console.log(loc_data.length)
					for (let i = 0, j=0; i < loc_data.length; i=i+2,j++) {
						coords[j] = proj4(wgs_proj, lat_long_proj, [loc_data[i],loc_data[i+1]]);
						// console.log([loc_data[i],loc_data[i+1]])
						
						// break;
					}
				
				}else{
					coords = proj4(wgs_proj, lat_long_proj, loc_data)
				}
				a_rec.geometry.coordinates = coords
				if(a_rec.geometry.type == "Polygon"){
					a_rec.geometry.coordinates = [coords]
				}
				
				
				//myrec.
				myrec = {};
				myrec["type"] = "Feature"
				// myrec["name"] = a_rec.type
				myrec["geometry"] = a_rec.geometry
				myrec["properties"] = a_rec.properties
				myrec["properties"]["name"] = a_rec.type
				
				// json_data += JSON.stringify(a_rec,null, "\t");
				
				json_data += JSON.stringify(myrec,null, "\t")+',\n\t';
				// json_data += '\n'+JSON.stringify(myrec,null, "\t")+',\n';
				// json_data += JSON.stringify(a_rec.geometry,null, "\t")+',';
			})
			console.log(json_data)
			json_data = json_data.substring(0, json_data.length - 3) + '\n]}';
						
			// json_data += '],'+JSON.stringify(crs,null,'\t')+'\n]}';
			return json_data;
            

            // return prettifyXml(xw.toString());
            // console.log(xw.toString());
        };

        return {};
    });