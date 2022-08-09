define({
    root: {
		assetSearch: 'TPSODL Asset Search',
		assetSearchBoxHint: 'TPSODL Asset search',
		tpsodl_feature_within_buffer: {
            'SelectCriteria': 'Please select a criteria',
            'objectAlert': 'Please select any object on map',
            'datasetAlert': 'Please select Dataset for search',
            'selectQueryAlert': 'Please select Query for search',
            'featureAlert': 'Please select feature for search',
            'bufferAlert': 'Buffer distance value should be greater than 0',
            'largeBuffer': 'Buffer distance value should not exceed 10km',
            'trailAlert': 'Please draw trail on map',
            'errorMsg': 'Data is not available for selected feature',
            'SucessMsg': 'Results Generated for Feature within Buffer'
        },
		tpsodl_add_external_data_to_Map: {
			'interactionEnabled' : "Please Drag and Drop required files."
		},
		tpsodl_feature_export: {
            kmlValidation: 'Please select both dataset and collection',
            reportsMsg: 'A KML Report has been requested.  It will download automatically when complete',
            NoDataFound: 'No KML data found for selected collection.',
            ReportGenerated: 'The KML Report has successfully generated. Please check your downloads',
            SelectPolygon: 'Please select a smaller area(polygon) to generate KML file',
            errorMsg: 'Error occured while creation'
        },
		tpsodl_user_audit: {
            getUsers: "https://" + window.location.hostname + ":32060/get_users",
            auditReport: "https://" + window.location.hostname + ":32060/audit_report",
            inputValidation: "Please provide all the mandatory fields highlited in the tool",
            startNodeServer: "Please start the node server",
            invalidDates: "From or To date is greater than current date",
            nodeNotRunning: "Node server is not running!",
            ReportSuccess: "Report generated successfully.",
            noData: "No records found.",
            ToDateValidate: "Please ensure that To-Date is greater than or equal to From-Date."
		},
        common_messages: {
            errMsg: 'Server Error',
        }
    }
});