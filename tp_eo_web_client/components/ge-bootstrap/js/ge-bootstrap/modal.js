'use strict';

define(
	[
		'jquery'
	], function($) {

		// Never try and talk to elements including the body until the page is ready.
		$(document).ready(
			function() {

				var isTouchDevice = 'ontouchstart' in document.documentElement;

				if(isTouchDevice)
				{
					// Fix issue where ipad scrolls when draggin on modal background
					$(window).on(
						"touchmove", function(event) {
							if($(event.target).hasClass('modal'))
							{
								// no more scrolling
								event.preventDefault();
							}
						});

				}

			});
	});
