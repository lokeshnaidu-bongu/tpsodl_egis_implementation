define([
  'jquery',
  'bootstrap/collapse'
], function($) {
  'use strict';

  function togglePanelToggle(event) {
    var $target = $(event.target);
    var $toggle = $target.parent('.panel').find('.panel-toggle');
    if (event.type === 'show' || (event.type === 'load' && $target.hasClass('in'))) {
      $toggle.addClass('in');
    } else if (event.type === 'hide') {
      $toggle.removeClass('in');
    }
  }

  // Make accordion carets animate and initialize them on page load.
  $('.panel-group .collapse')
    .on('show hide load', togglePanelToggle)
    .trigger('load');
});
