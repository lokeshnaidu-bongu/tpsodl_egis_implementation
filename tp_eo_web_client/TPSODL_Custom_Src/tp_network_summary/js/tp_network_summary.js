/**
** **********************************************************************************
** 
** TPSODL EIS Implementation Project
** 
** Created By: Triveni Damarla, TCS
** Date: 
** 
** Description:
** 
** **********************************************************************************
*/



/**
 * Configurable Sidebar component for displaying Hello-smallworld panel.
 * @module TpNetworkSummary
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
    'jquery',
    'underscore',
    'i18n!nls/messages',
    'text!tp_network_summary_partials/tp_network_summary.html',
    'hogan',
    'comms',
    'map-core-component/pubsub'
  ],
  function TpNetworkSummary($, _, Messages, template, hogan, CommsLayer) {
    'use strict';

	var cardTemplate = hogan.compile(template),
		sidebarControlName = 'tp_network_summary',
		network_summary_headings = ["Circle","Division","Sub-Division","Section","GSS","33kv Feeder","PSS","11kv Feeder","DSS","LT Feeder","Consumer"],
		column_name = "",
		$cardSelector;

    /**
     * @memberof module:TpNetworkSummary
     * @private
     * @listens ViewerEvents.leavingSidebar
     * @listens ViewerEvents.gotoSidebar
     * @listens ViewerEvents.mapInitialised
     * @listens ViewerEvents.sidebarContainerReady
     * @listens ViewerEvents.exportRequested
     */
    var eventSubscribe = function eventSubscribe() {
      $.subscribe('sidebarContainerReady', function (targetName, $targetSelector) {
        if (targetName === sidebarControlName) {
          initialise($targetSelector, {
            id: targetName
          });
        }
      });

      $.subscribe('leavingSidebar', function (target) {
        if (target === sidebarControlName) {
          //what should be done on leaving hello-smallworld sidebar
        }
      });

      $.subscribe('gotoSidebar', function (target) {
        if (target === sidebarControlName) {
          // what should be done on entering hello-smallworld sidebar
		  // console.log($("#flink"));
		  // $("#flink").click(function(){
		  // console.log("-----")
		  // var test = document.getElementById("#tab1");
		  // alert(test);
		  
	// });
        }
      });

      $.subscribe('mapInitialised', function (mapNameRef, olMapRef) {
        // what should happen when map is initialized
      });
    };

    eventSubscribe();
	
	var raiseValidationError = function raiseValidationError(errMessage) {

		$.publish("raiseTempMessage", [errMessage, {
			messageType: "error"
		}]);
	};
	var raiseSuccessMessage = function raiseSuccessMessage(succMessage) {

		$.publish("raiseTempMessage", [succMessage, {
			messageType: "success"
		}]);
	};
	var raiseWarningMessage = function raiseWarningMessage(WarnMessage) {

		$.publish("raiseTempMessage", [WarnMessage, {
			messageType: "warning"
		}]);
	};

    var initialise = function initialise(selector) {
      $cardSelector = selector;
      buildUI();
    };

    var buildUI = function buildUI() {
		var options = {messages: Messages,};
		$cardSelector.append(cardTemplate.render(options));
		
		$.each(network_summary_headings,function(a_head,a_val){
		$('#query_type').append( $("<option>")
						.val(a_head)
						.html(a_val)
		)
		})
		
		query_changed();
		$("#query_type").change(function(){
			query_changed();
		});

		
		$("#getNwSummary").click(function(){
			// 
			getNetworkSummaryReport();
			//get_counts_success(null)
		});
		
		$("#getNetworkSummary").click(function(){
			// 
			getNetworkSummaryReport();
			//get_counts_success(null)
		});
	};
	
	function query_changed(){		
			$('#qeury_value').attr("placeholder", "Enter " + $('#query_type  :selected').text() +" Name");	
		};
	
	function getNetworkSummaryReport(){
		// Get summary of all required network elements
		var get_counts = {
			json: true,
			method: 'get_counts'
		};

		CommsLayer.getGSSRequest(get_counts, get_counts_success, error_callback);

	}
	
	function getDTSummary(){
		// Get summary of all required network elements
		var getDTSummary = {
			json: true,
			method: 'get_dt_summary'
		};

		CommsLayer.getGSSRequest(getDTSummary, getDTSummary_success, error_callback);

	}
	
	var get_counts_success = function get_counts_success(res){
		var dataset = new Array(network_summary_headings.length);
		
		var network_summary = res.summary;
		$.each( network_summary, function(k,v){
			dataset[network_summary_headings.indexOf(k)] = v;
		});
		
		$("#network_summary_main").html("<table id='network_summary_main_table' class='cell-border hover' width='100%' style='border: 1px solid #dddddd;' cellspacing='0' width='100%'></table>");
		
		var titleArray = [];
		var colum_defs_arr = []
		
		for (var i = 0; i < network_summary_headings.length; i++) {
			var temp = {};
			temp['title'] = "<font style='color:white;'>" + network_summary_headings[i] + "</font>";
			titleArray.push(temp);

			var target_local = {};
			target_local['targets'] = i;
			target_local['className'] = 'link';
			target_local['render'] = function(output) {
						return "<a>"+output+"</a>"
					};

			colum_defs_arr.push(target_local);
		}
		
		
		// Preparing DataTable
		$('#network_summary_main_table').DataTable({
			"data": [dataset],
			columns: titleArray,
			scrollY: '10vh',
			scrollX: '2vh',
			dom: 'lB<"toolbar">frtip',

			destroy: true,
			buttons : [],
			"bPaginate": false,
			"bLengthChange": false,
			"bFilter": false,
			"bInfo": false,
			"bAutoWidth": false,
			columnDefs : colum_defs_arr,
			scroller: {
				loadingIndicator: true
			},
		});
	};
	
	// 
	$(document).on("click", "table#network_summary_main_table td", function(e){
		
		var data_id = this.cellIndex
		// var data_val = this.text();
		column_name = network_summary_headings[data_id];
		
		if(column_name == "DSS") {
			getDTSummary();
		}
		
	});
	
	function getDTSummary_success(res){
		console.log(">> getDTSummary_success", res)
		
		var downstream_network = res.downstream;
		var upstream_network = res.upstream;
		
		prepareDownstreamSummary(downstream_network);
		prepareUpstreamSummary(upstream_network);
	}
	
	var prepareDownstreamSummary = function(downstream_network){
		
		var c_index = network_summary_headings.indexOf(column_name);
		
		var d_array = network_summary_headings.slice(c_index);
		
		var titleArray = [];
		var colum_defs_arr = []
		
		for (var i = 0; i < d_array.length; i++) {
			var temp = {};
			temp['title'] = "<font style='color:white;'>" + d_array[i] + "</font>";
			titleArray.push(temp);
		}
		
		var dataset = [];
		
		$.each( downstream_network, function(k,v){
			//
			// console.log(k, " , ", v);
			var temp_arr = [k,v[0],v[1]];
			dataset.push(temp_arr)
		});
		
		// console.log("Dataset : ",dataset);
		
		$("#network_summary_downstream").html("<div class=divText><b><u>Downstream Summary : </u></b></div><br/><table id='network_summary_downstream_table' class='cell-border hover' width='100%' style='border: 1px solid #dddddd;' cellspacing='0' width='100%'></table>");
		
		// Preparing DataTable
		$('#network_summary_downstream_table').DataTable({
			"data": dataset,
			columns: titleArray,
			scrollY: '30vh',
			scrollX: '2vh',
			dom: 'lB<"toolbar">frtip',

			destroy: true,
			
			buttons: [{
				extend: 'collection',
				text: 'Export',
				buttons: [{
						extend: 'excel',
						text: 'E<u>x</u>cel',
						key: {
							key: 'x',
							altKey: true
						},
						title: 'Downstream Summary Report',
						className: 'excelButton'
					},
					{
						extend: 'csv',
						text: '<u>C</u>sv',
						key: {
							key: 'c',
							altKey: true
						},
						title: 'Downstream Summary Report',

						className: 'csvButton'
					}
				]
			}],

			"pageLength": 5,
			"lengthMenu": [
				[5, 10, 20, -1],
				[5, 10, 20, "All"]
			],
			columnDefs : colum_defs_arr,
			scroller: {
				loadingIndicator: true
			},
		});
	}
	
	var prepareUpstreamSummary = function(upstream_network){
		var c_index = network_summary_headings.indexOf(column_name);
		
		var d_array = network_summary_headings.slice(0,c_index+1);
		
		console.log("d_array = ,", d_array)
		
		var titleArray = [];
		var colum_defs_arr = []
		
		for (var i = 0; i < d_array.length; i++) {
			var temp = {};
			temp['title'] = "<font style='color:white;'>" + d_array[i] + "</font>";
			titleArray.push(temp);
		}
		
		var dataset = [];
		
		$.each( upstream_network, function(k,v){
			var temp_arr = new Array(d_array);
			$.each( v, function(v_k,v_v){
				temp_arr[d_array.indexOf(v_k)] = v_v;
			});
			
			temp_arr[temp_arr.length] = k;
			dataset.push(temp_arr)
		});
		
		
		$("#network_summary_upstream").html("<div class=divText><b><u>Upstream Summary : </u></b></div><br/><table id='network_summary_upstream_table' class='cell-border hover' width='100%' style='border: 1px solid #dddddd;' cellspacing='0' width='100%'></table>");
		
		// Preparing DataTable
		$('#network_summary_upstream_table').DataTable({
			"data": dataset,
			columns: titleArray,
			scrollY: '30vh',
			scrollX: '2vh',
			"bAutoWidth": true,
			dom: 'lB<"toolbar">frtip',

			destroy: true,
			
			buttons: [{
				extend: 'collection',
				text: 'Export',
				buttons: [{
						extend: 'excel',
						text: 'E<u>x</u>cel',
						key: {
							key: 'x',
							altKey: true
						},
						title: 'Upstream Summary Report',
						className: 'excelButton'
					},
					{
						extend: 'csv',
						text: '<u>C</u>sv',
						key: {
							key: 'c',
							altKey: true
						},
						title: 'Upstream Summary Report',

						className: 'csvButton'
					}
				]
			}],

			"pageLength": 5,
			"lengthMenu": [
				[5, 10, 20, -1],
				[5, 10, 20, "All"]
			],
			columnDefs : colum_defs_arr,
			scroller: {
				loadingIndicator: true
			},
		});
	}
	
	var error_callback  = function error_callback(res){
		raiseValidationError("Request Failed!!!")
	}

	
	var api = {};
    /* test-code */
    api.__TEST_ONLY__ = {};
    /* end-test-code */

    return api;
	
  });