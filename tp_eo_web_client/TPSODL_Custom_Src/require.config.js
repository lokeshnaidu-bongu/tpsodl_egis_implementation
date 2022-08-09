require([], function () {
      'use strict';
      require.config({
		baseUrl: "./",
		paths: {
			"custom/nls": "TPSODL_Custom_Src/nls/root",
			
			/*Start : TPSODL customizations*/
			// Show and Hide sidebar
			"tpsodl_show_hide_sidebar":"TPSODL_Custom_Src/tpsodl_show_hide_sidebar/js/tpsodl_show_hide_sidebar",
			"tpsodl_show_hide_sidebar_partials":"TPSODL_Custom_Src/tpsodl_show_hide_sidebar/partials",
			
			// Previous, Next view navigations and clear map functionality
			"tpsodl_previous_next_view":"TPSODL_Custom_Src/tpsodl_previous_next_view/js/tpsodl_previous_next_view",
			"tpsodl_previous_next_view_partials":"TPSODL_Custom_Src/tpsodl_previous_next_view/partials",
			
			// Goto Home view support
			"tpsodl_goto_home":"TPSODL_Custom_Src/tpsodl_goto_home/js/tpsodl_goto_home",
			"tpsodl_goto_home_partials":"TPSODL_Custom_Src/tpsodl_goto_home/partials",
			
			// View full map
			"tpsodl_view_full_map":"TPSODL_Custom_Src/tpsodl_view_full_map/js/tpsodl_view_full_map",
			"tpsodl_view_full_map_partials":"TPSODL_Custom_Src/tpsodl_view_full_map/partials",
			
			// Show mouse Position
			"tpsodl_show_mouse_position":"TPSODL_Custom_Src/tpsodl_show_mouse_position/js/tpsodl_show_mouse_position",
			"tpsodl_show_mouse_position_partials":"TPSODL_Custom_Src/tpsodl_show_mouse_position/partials/",
			
			// //Scroll for Sidebar
			// "tpsodl_scroll_for_sidebar_items":"TPSODL_Custom_Src/tpsodl_scroll_for_sidebar_items/js/tpsodl_scroll_for_sidebar_items",
			// "tpsodl_scroll_for_sidebar_items_partials":"TPSODL_Custom_Src/tpsodl_scroll_for_sidebar_items/partials/",
			
			//User Bookmarks
			"tpsodl_bookmarks":"TPSODL_Custom_Src/tpsodl_bookmarks/js/tpsodl_bookmarks",
			"tpsodl_bookmarks_partials":"TPSODL_Custom_Src/tpsodl_bookmarks/partials/",
			
			//Objects within the buffer
			"tpsodl_feature_within_buffer":"TPSODL_Custom_Src/tpsodl_feature_within_buffer/js/tpsodl_feature_within_buffer",
			"tpsodl_feature_within_buffer_partials":"TPSODL_Custom_Src/tpsodl_feature_within_buffer/partials/",
			
			// Add External Data to Map
			"tpsodl_add_external_data_to_Map":"TPSODL_Custom_Src/tpsodl_add_external_data_to_Map/js/tpsodl_add_external_data_to_Map",
			"tpsodl_add_external_data_to_Map_partials":"TPSODL_Custom_Src/tpsodl_add_external_data_to_Map/partials/",
			
			// Export Features
			"tpsodl_feature_export":"TPSODL_Custom_Src/tpsodl_feature_export/js/tpsodl_feature_export",
			"tpsodl_feature_export_partials":"TPSODL_Custom_Src/tpsodl_feature_export/partials/",
			
			//DataTables
			"datatables.net":"components/datatables/js/jquery.dataTables.min",
			"datatables.net-buttons":"components/datatables/js/dataTables.buttons.min",
			"datatables-btn-html":"components/datatables/js/buttons.html5.min",
			"datatables-colrecorder":"components/datatables/js/dataTables.colReorder.min",
			"datatables-select":"components/datatables/js/dataTables.select.min",
			
			//User Audit Dashboard
			"tpsodl_user_audit":"TPSODL_Custom_Src/tpsodl_user_audit/js/tpsodl_user_audit",
			"tpsodl_user_audit_partials":"TPSODL_Custom_Src/tpsodl_user_audit/partials/",
			// JSZIP
			// 'jszip':'components/jszip/jszip',
			// "jszip-load":"components/jszip/jszip-load",
			
			// XML-Writer
			// 'xml-writer':'components/xml-writer/lib/xml-writer',
			
			// steps
			stepper: "components/steps/js/jquery.steps",
			stepper: "components/steps/js/jquery.steps",
			
			"tp_network_summary":"TPSODL_Custom_Src/tp_network_summary/js/tp_network_summary",
			"tp_network_summary_partials":"TPSODL_Custom_Src/tp_network_summary/partials/",
			
			// Export Data
			"tpsodl_export_data_kml":"TPSODL_Custom_Src/tpsodl_export_data/js/tpsodl_export_data_kml",
			"tpsodl_export_data_json":"TPSODL_Custom_Src/tpsodl_export_data/js/tpsodl_export_data_json"
			
		}
	});
	require([
		'tpsodl_show_hide_sidebar',
		'tpsodl_previous_next_view',
		'tpsodl_goto_home',
		'tpsodl_view_full_map',
		'tpsodl_show_mouse_position',
		'tpsodl_feature_within_buffer',
		'tpsodl_bookmarks',
		'tpsodl_add_external_data_to_Map',
		'tpsodl_user_audit',
		'tpsodl_feature_export',
		'tpsodl_export_data_kml',
		'tpsodl_export_data_json',
		'tp_network_summary'
	])
});
