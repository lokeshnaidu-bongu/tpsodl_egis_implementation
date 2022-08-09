require.config(
    {
        shim: {
            'bootstrap-datepicker': ['jquery']
        }
    });

define(
    [
        'jquery',
        'bootstrap-datepicker'
    ], function ($) {
        'use strict';

        var isTouchDevice = 'ontouchstart' in document.documentElement;

        $('.datepicker').each(function () {
            var currentComponent = this;
            if (isTouchDevice) {
                $(this).attr('type', 'date');
            } else {
                $(this).datepicker(
                    {
                        autoclose: false,
                        todayBtn: "linked", // Without 'linked' as a value it will not select it, only bring it into view.
                        todayHighlight: true
                    });
            }

            var btn = $(this).next('.btn.add-on');
            if (btn.length == 0) {
                btn = $(this).next('.add-on,.input-group-btn').find(".btn");
            }

            btn.click(
                function () {
                    $(currentComponent).focus();
                });
        });

        return $;
    });
