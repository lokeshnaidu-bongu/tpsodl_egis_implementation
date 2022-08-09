define([
    'jquery'
], function($) {
    'use strict';

    var placeholderFn = function(selector) {

        function isIE9 () {
            var myNav = navigator.userAgent.toLowerCase();
            var ieVersion = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;

            return ieVersion == 9;
        }

        if (isIE9()) {

            var ph = $(selector);

            ph.focus(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                    input.removeClass('placeholder');
                    input.css('font-style','normal');
                }
            }).blur(function() {
                var input = $(this);
                if (input.val() == '' || input.val() == input.attr('placeholder')) {
                    input.addClass('placeholder');
                    input.val(input.attr('placeholder'));
                    input.css('font-style','italic');
                }
            }).blur();


            ph.parents('form').submit(function () {
                $(this).find('[placeholder]').each(function() {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                })
            });

        }
    };

    // Pre-init existing placeholders.
    placeholderFn('[placeholder]');

    return placeholderFn;
});//define