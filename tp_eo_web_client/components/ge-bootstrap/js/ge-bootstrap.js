require.config(
	{
		shim: {
			'bootstrap/transition': ['jquery'],
			'bootstrap/affix': ['jquery'],
			'bootstrap/alert': ['jquery'],
			'bootstrap/button': ['jquery'],
			'bootstrap/carousel': ['jquery', 'bootstrap/transition'],
			'bootstrap/collapse': ['jquery', 'bootstrap/transition'],
			'bootstrap/dropdown': ['jquery'],
			'bootstrap/modal': ['jquery', 'bootstrap/transition'],
			'bootstrap/popover': ['jquery', 'bootstrap/tooltip'],
			'bootstrap/scrollspy': ['jquery'],
			'bootstrap/tab': ['jquery'],
			'bootstrap/tooltip': ['jquery'],
			// 'bootstrap/typeahead': ['jquery'],
			'ge-bootstrap/accordion': ['jquery'],
			'ge-bootstrap/placeholder': ['jquery'],
			'ge-bootstrap/modal': ['jquery']
		}
	});

define(
	[
		'jquery',
		'bootstrap/affix',
		'bootstrap/alert',
		'bootstrap/button',
		'bootstrap/modal',
		'bootstrap/scrollspy',
		'bootstrap/tab',
		'bootstrap/tooltip',
		'bootstrap/transition',
		// 'bootstrap/typeahead',
		'bootstrap/carousel',
		'bootstrap/collapse',
		'bootstrap/dropdown',
		'bootstrap/popover',
		'ge-bootstrap/accordion',
		'ge-bootstrap/placeholder',
		'ge-bootstrap/modal'
	], function($) {
		'use strict';
		return $;
	}
);
