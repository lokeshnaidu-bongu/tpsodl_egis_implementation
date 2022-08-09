define([
  'jquery'
], function ($) {
  'use strict';

	$('.collapsible-list-parent').click(function(e) {
		$(this).next().slideToggle('fast');
		if ($(this).parent().hasClass('open')) {
      $(this).parent().removeClass('open');
    } else {
      $(this).parent().addClass('open');
    }
	});

  // Apply color based on click and reset non-current location
  $('.collapsible-list a strong').click(function(e) {

    $('.collapsible-list a strong').removeClass('selected-nav');
    
    $(this).addClass('selected-nav');
  });



  return $;

});
