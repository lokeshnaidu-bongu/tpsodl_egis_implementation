define([
    'jquery',
    'underscore',
	'proj4',
    'i18n!viewer/nls/messages',
    'download',
    'OpenLayers3',
    'map-core-component/pubsub'
  ],
  function CustomKMLExport($, _, proj4, Messages, Download, OpenLayers) {
    'use strict';
    var fileExtension = 'kml',
      defaultOptions = {
        title: Messages.export.defaultTitle,
        fileName: Messages.export.defaultFileName,
        fileExtension: fileExtension,
        type: Download.fileTypes.KML
      };

    var exportRecords = function exportRecords(data, options) {
      var opts = _.extend({
        date: new Date()
      }, defaultOptions, options);
		
      opts.fileName = opts.fileName + fileExtension;
      opts.data = genereateKml(data);

      $.publish('clientItemReadyForDownload', [opts]);
    };

    $.subscribe('exportRecordsCustomKML', exportRecords);
	
		var prettifyXml = function(sourceXml)
{
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

	var genereateKml = function(a) {
		console.log("data = ",a);
		
		var coords = [];
	
		var wgs_proj = proj4('EPSG:3857');
		var lat_long_proj = proj4('EPSG:4326');
		
		var xw = new XMLWriter;
		xw.startDocument();
		xw.startElement('kml');
		xw.writeAttribute('xmlns', 'http://www.opengis.net/kml/2.2');
		xw.text('\n');
		xw.startElement('Document');
		xw.text('\n'+'\t');
		
		// Adding Custom styles - Start
		xw.startElement('Style');
		xw.writeAttribute('id', 'Custom_style');
		xw.startElement('LabelStyle');
		xw.startElement('color');
		xw.text('9900ffff');
		xw.endElement(); // color
		xw.endElement(); // Labelstyle
		xw.startElement('LineStyle');
		xw.startElement('color');
		xw.text('ffff00ff');
		xw.endElement(); // color
		xw.startElement('width');
		xw.text('2');
		xw.endElement(); // width
		xw.endElement(); // LineStyle
		xw.startElement('PolyStyle');
		xw.startElement('color');
		xw.text('ffff00ff');
		xw.endElement(); // color
		xw.startElement('fill');
		xw.text('0');
		xw.endElement(); // fill
		xw.endElement(); // PolyStyle
		xw.endElement(); // Style
		
		// Adding Custom styles - End
	

		_.each(a, function(a_1) {
			var l_geom = a_1.parsedGeom[0].T.geometry.A
			//var l_geom = a_1.geometry;
			console.log(a_1);
			xw.startElement('Placemark');
			xw.startElement('styleUrl');
			xw.text('#Custom_style');
			xw.endElement();
			xw.startElement('Attributes');
			
			_.each(a_1.properties,function(i_value, i_key){
				console.log(i_key, i_value)
				xw.startElement('Attribute')
				xw.writeAttribute('name', i_key)
				console.log(i_value)
				xw.text(String(i_value))
				xw.endElement();
				
			})
			xw.endElement();
			xw.startElement('name');
			xw.text(a_1.name.toString());
			xw.endElement();
			xw.startElement('description');
			xw.endElement();
			xw.startElement(a_1.geometry.type);
			if(a_1.geometry.type == "Polygon"){
				xw.startElement("outerBoundaryIs")
				xw.startElement("LinearRing")
								
			} 			
			xw.startElement("coordinates");
			
			coords=[];
			for (let i = 0, j=0; i < l_geom.length; i=i+2,j++) {
				
				coords[j] = proj4(wgs_proj, lat_long_proj, [l_geom[i],l_geom[i+1]]);
				xw.text(coords[j].join(","));
				/* if(j==0){
				}else{
					xw.text(','+coords[j].join(","));
				} */
				xw.text('\t');
			}
			// xw.text('\n');
			
			// xw.text(proj4(wgs_proj,lat_long_proj,l_geom).join(","));
			// console.log("coords",coords);
			// xw.text(coords);
			xw.endElement();
			xw.endElement();
			xw.endElement();
			if(a_1.geometry.type == "Polygon"){
				xw.endElement();
				xw.endElement();
								
			}
			
		})
		
		xw.endDocument();
	 
	 return prettifyXml(xw.toString());
		// console.log(xw.toString());
	};
	
    return {};
  });