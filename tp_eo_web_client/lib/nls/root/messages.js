define({
  auth: {
    userInfoError: 'Unable to get user information',
    signout: 'Sign out'
  },
  breakpoints: {
    breakpoint: 'Breakpoint',
    lastEquipment: 'Last Equipment'
  },
  commsLayer: {
    unauthenticated: 'Unauthenticated access to system service. Your session may have expired. Refresh browser page to login again.',
    unauthorized: 'Unauthorised access to system service.',
    serverError: 'Server error ("$1"). If this persists, please contact your system administrator.',
    tileAccessUnauthenticated: 'Unauthenticated access to map data. Your session may have expired. Refresh browser page to login again.',
    tileAccessUnauthorized: 'Unauthorised access to map data.',
    tileAccessServerError: 'Server error accessing map data ("$1"). If this persists, please contact your system administrator.',
  },
  connectivity: {
    showConnectivity: 'View Connectivity',
    componentName: 'Connectivity'
  },
  download: {
    componentName: 'Downloads',
    dateTime: 'Downloaded $1 at $2',
    empty_list: 'No files downloaded recently',
    title: 'Downloads',
    today: 'today'
  },
  error_handler: {
    alertHeading: 'System Error',
    followUpDirections: 'Please contact your system administrator.',
    closeButton: 'Close'
  },
  export: {
    defaultFileName: 'exported-records.',
    defaultTitle: 'Exported Records',
    collectionType: 'Collection Type',
    urn: 'URN',
    types: {
      xlsx: 'Export to XLSX',
      csv: 'Export to CSV'
    }
  },
  find: {
    componentName: 'Find',
    clearButton: 'Clear',
    exportFileTitle: 'Find Results',
    exportFileName: 'find-results.',
    selectQueryType: 'Query Type',
    submitButton: 'Run',
    AddButton: 'Add Coordinate',
    title: 'Find',
    setFindArea: 'Set Find Area',
    spatialConstraints: {
      tooltip: 'Spatial constraints',
      anywhere: 'Anywhere',
      withinMap: 'Within map',
      withinArea: 'Within area',
      withinAreaFooterMessage: 'To restrict the search to specific area, select the area and click Set Find Area Button on its popover.',
      noSearchAreaDefined: 'Please specify search area.'
    },
    dateFieldFrom: 'from',
    dateFieldTo: 'to',
    invalidOrderOfDates: 'Date range is invalid. Range end date should not be earlier than start date.',
	timeOut: 'Your query has timed out, which usually indicates that the search is attempting to return too much data. Try refining your query to return a smaller result set.'
  },
  internals: {
    title: 'Internals',
    largeIntButtonName: 'Large Internals'
  },
  map_layers: {
    requestFailed: 'Request to retrieve layer list information failed. Try refreshing browser.'
  },
  map_view: {
    componentName: 'Map'
  },
  object_details: {
    componentName: 'Object Details',
    nothingSelected: 'No object selected yet.',
    showDetailsButton: 'View in Object Details',
    nextButton: 'Next',
    prevButton: 'Previous',
    relatedDocumentsSection: 'Related Documents',
    relatedDocumentsMessage: 'Copy the file path below and paste it as appropriate.'
  },
  spatial_contexts: {
    title: 'Alternative Views',
    noContext: 'No spatial contexts found.'
  },
  plotting: {
    componentName: 'Plot',
    downloadTitle: '$1 plot',
    layoutNotSelected: 'Please select a plot type from the list',
    plotButton: 'Plot',
    resetButton: 'Reset viewport',
    plotComplete: 'The plot has successfully completed. Please check your downloads',
    plotDescription: 'Click Plot to download a PDF plot of the current map bounds. Plot type determines template, scale and object visibilities used.',
    plotFailed: 'Something went wrong in plotting.  Please try again or contact a system administrator',
    plotStarted: 'A plot has been requested.  It will download automatically when complete',
    selectLayoutType: 'Plot Type',
    selectResolution: 'View Scale',
    title: 'Options',
  },
  results_list: {
    noResults: 'No results',
    showDetailsButton: 'Details',
    pageCount: '$1/$2',
    nextButton: 'Next',
    prevButton: 'Previous',
    noCollectionType: 'Unknown Collection Type',
    exportButton: 'Export',
    exportDefaultFileTitle: 'Results',
    exportDefaultFileName: 'results.',
    filterButton: 'Apply Filter',
    changefilterButton: 'Change Filter',
    listCount: 'Showing $2 - $3 of $1',
    listFilteredCount: 'Showing $3 - $4 of $1 (filter applied)',
    filter: {
      okButton: 'OK',
      cancelButton: 'Cancel',
      title: 'Filter List',
      selectAllOption: 'Select all results'
    }
  },
  sketching: {
    area: 'Area',
    areaDescription: 'Click on the map to start a polygon area.  Single click to continue the area or double-click to finish the shape.',
    areas: 'Areas',
    arrow: 'Arrow',
    arrowDescription: 'Click on the map to start an arrow line. Single-click to create another vertex or double-click to complete the arrow.',
    arrows: 'Arrows',
    clearButton: 'Clear',
    componentName: 'Sketching',
    defaultSubject: 'Web Task',
    defaultTask: 'General',
    deleteSketchButton: 'Delete',
    detailsTitle: 'Details',
    errorRetrievingTaskTypes: 'Something went wrong retrieving the tasks types',
    idLabel: 'Id',
    line: 'Line',
    lineDescription: 'Click on the map to start a line.  Single-click to create another vertex or double-click to complete the line.',
    lines: 'Lines',
    notesLabel: 'Notes',
    point: 'Point',
    pointDescription: 'Click on the map to create a single point.',
    recipientLabel: 'Recipient *',
    recipientNotSelected: 'Please select a recipient from the list',
    requiredFieldLabel: '* Required field',
    subjectLabel: 'Subject',
    submitButton: 'Submit',
    submitFailure: '<strong>Warning!</strong> <br /> The task could not be submitted. Please try again.  If task submission continues to fail, contact your system administrator.',
    submitSuccess: 'The task was successfully submitted.',
    symbols: 'Symbols',
    symbolsLoadWarning: 'Something went wrong retrieving the symbols library',
    taskTypeLabel: 'Task type *',
    taskTypeNotSelected: 'Please select a task type from the list',
    text: 'Text',
    textAreaPlaceHolder: 'Enter text',
    textDescription: 'Click on the map to create a text label.  Enter details into the popover and click anywhere on the map to complete.',
    texts: 'Texts',
    toolsTitle: 'Tools'
  },
  trace: {
    componentName: 'Trace',
    exportFileTitle: 'Trace Results',
    exportFileName: 'trace-results.',
    blockNodeButton: 'Block Nodes',
    clearButton: 'Clear',
    finishNodeButton: 'Finishing Point',
    selectQueryType: 'Trace Type',
    startNodeButton: 'Starting Point',
    submitButton: 'Run',
    emptySelectionMessage: 'No object has been selected.',
    sendToTraceButton: 'Send To Trace',
    traceTypesFailure: '<strong>Warning!</strong> <br /> Getting trace types was not succesful. Please contact your system administrator.',
    traceComplete: 'The trace has successfully completed.',
    traceFailed: 'Something went wrong in tracing.  Please try again or contact a system administrator',
    unableToSendToTrace: 'Unable to send to trace.',
    placeStartNodeNotAllowed: 'The current trace type does not support the placement of a start point on the map.',
    upstream: 'Upstream',
    downstream: 'Downstream',
    bothways: 'Both Ways',
    distance: 'Distance',
  },
  locationSearch: {
      componentName: "Locate",
      title: "Go to Coordinate",
      easting: "Easting",
      northing: "Northing",
      goto: "Go to",
      clear: "Clear",
      locateDescription: "Select a coordinate reference system from the drop down and enter a 12-digit coordinate "+
                         "(6-digit easting and 6-digit northing). Click 'Go to' to centre the map of the entered coordinates.",
      warningMessage: "Easting and Northing must both be integers."
    }
});
