/**
 * Configurable Sidebar component for displaying User-Audit panel.
 * @module UserAudit
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
        'jquery',
        'underscore',
        'i18n!custom/nls/messages',
        'text!tpsodl_user_audit_partials/tpsodl_user_audit.html',
        'hogan',
        'comms',
        'text!results-list-partials/marker_normal.svg',
        'map-core-component/pubsub',
        'spinner',
        'datatables',
        "datatables.net-buttons",
        "datatables-btn-html"

    ],
    function UserAudit($, _, Messages, template, hogan, CommsLayer, DefaultMarkerSvg) {
        'use strict';

        var cardTemplate = hogan.compile(template),
            sidebarControlName = 'tpsodl_user_audit',
            $cardSelector, $spinner, AuditDataTable,
            $dateFrom, $dateTo;
        var getUsers = Messages[sidebarControlName].getUsers,
            auditReport = Messages[sidebarControlName].auditReport;

        /**
         * @memberof module:UserAudit
         * @private
         * @listens ViewerEvents.leavingSidebar
         * @listens ViewerEvents.gotoSidebar
         * @listens ViewerEvents.mapInitialised
         * @listens ViewerEvents.sidebarContainerReady
         * @listens ViewerEvents.exportRequested
         */
        var eventSubscribe = function eventSubscribe() {
            $.subscribe('sidebarContainerReady', function(targetName, $targetSelector) {
                if (targetName === sidebarControlName) {
                    initialise($targetSelector, {
                        id: targetName
                    });

                }
                $.subscribe("userData", function(user) {
                    if (user.security_roles.indexOf("gss.admin") >= 0) {
                        $("ul.controls-list li a#tpsodl_user_audit").css("display", "inline-block")

                    } else {
                        $("ul.controls-list li a#tpsodl_user_audit").css("display", "none")
                    }

                })



            });

            $.subscribe('leavingSidebar', function(target) {
                //what should be done on leaving user audit sidebar
                if (target === sidebarControlName) {
                    $('#startdatepicker').css('border-color', '');
                    $('#enddatepicker').css('border-color', '');



                }
            });

            $.subscribe('gotoSidebar', function(target) {
                //what should be done on goto user audit sidebar
                if (target === sidebarControlName) {
                    $('#generateReport').prop('disabled', false);
                    $("#user option").remove();
                    var a = new Date()
                    a.setDate(a.getDate() - 2)
                    var b = new Date();
                    var prevdate = a.toISOString().split('T')[0];
                    prevdate = prevdate.split("-");
                    prevdate = prevdate[2] + "/" + prevdate[1] + "/" + prevdate[0];
                    var currentdate = new Date().toISOString().split('T')[0];
                    currentdate = currentdate.split("-");
                    currentdate = currentdate[2] + "/" + currentdate[1] + "/" + currentdate[0];
                    $('#startdatepicker').val(prevdate)
                    $('#enddatepicker').val(currentdate);
                    var users = document.getElementById('user')
                    var opt = document.createElement("option");
                    opt.text = 'All Users';
                    opt.value = 'all';
                    users.options.add(opt);

                    $.ajax({

                        url: getUsers,
                        method: 'GET',
                        success: function(data) {
                            var select = document.createElement('SELECT')

                            data.forEach(function(a) {
                                var opt = document.createElement("option");
                                opt.text = a.username;
                                opt.value = a.username;
                                users.options.add(opt);
                            })

                        },
                        error: function(error) {
                            raiseValidationError(Messages[sidebarControlName].startNodeServer);
                        }
                    });



                }
            });

            $.subscribe('mapInitialised', function(mapNameRef, olMapRef) {
                // what should happen when map is initialized
                $spinner = $($cardSelector).find('#audit_spinner');
				$("#auditTable").hide();
				$("#auditTable_div").hide();
				$.getJSON('https://ipinfo.io/json', function(data) {
				});
            });
        };

        eventSubscribe();
        //To show Error messages
        var raiseValidationError = function raiseValidationError(errMessage) {

            $.publish("raiseTempMessage", [errMessage, {
                messageType: "error"
            }]);
        };

        //To show Success messages
        var raiseSuccessMessage = function raiseSuccessMessage(succMessage) {

            $.publish("raiseTempMessage", [succMessage, {
                messageType: "success"
            }]);
        };
		

        //To display data
        var renderDatatable = function(dataset) {
			$("#auditTable").show();
			$("#auditTable_div").show();
			$("#auditHeader").show();
            $('#auditTable').DataTable({
				"order": [[2, 'desc']],
                "data": dataset,
                "columns": [{
                        "data": "username"
                    },
                    {
                        "data": "login"
                    },
                    {
                        "data": "logout"
                    },
                    {
                        "data": "ip"
                    }
                ],
                scrollY: '38vh',
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
                            title: 'User Audit Report',
                            className: 'excelButton'
                        },
                        {
                            extend: 'csv',
                            text: '<u>C</u>sv',
                            key: {
                                key: 'c',
                                altKey: true
                            },
                            title: 'User Audit Report',

                            className: 'csvButton'
                        }
                    ]
                }],

                "pageLength": 5,
                "lengthMenu": [
                    [5, 10, 20, -1],
                    [5, 10, 20, "All"]
                ],
                "columnDefs": [{
                    "targets": -1
                    
                }],
                scroller: {
                    loadingIndicator: true
                },
            });

        }

        //To on spinner
        var spinOn = function spinOn() {
            if ($spinner) {
                $spinner.spin();
            }
			$('#generateReport').prop('disabled', true);
        };
        //To off spinner
        var spinOff = function spinOff() {
            if ($spinner) {
                $spinner.spin(false);
            }
			$('#generateReport').prop('disabled', false);
        };

        var initialise = function initialise(selector) {
            $cardSelector = selector;
            buildUI();

            $("#auditModal").on('hide.bs.modal', function() {
                $('#generateReport').prop('disabled', false);
                $("#auditTable").empty()
				$("#auditTable_div").hide();
            })
            $('#clear').click(function() {
				$("#auditTable_div").hide();
				$("#auditTable").hide();
                $("#auditModal").modal("hide");
                $dateFrom.datepicker('setDate', new Date());
                $dateTo.datepicker('setDate', new Date());
                $("#user").val("all").change();
                $("#auditTable tbody").empty()

            });
            $('#generateReport').click(function() {
				
				$("#auditTable").hide();
				$("#auditTable_div").hide();
               
                var username = $('#user').val()
                var loginstart = $('#startdatepicker').val()
                var loginend = $('#enddatepicker').val()

                var fromdate = loginstart.split("/");
                var from_Date = fromdate[1] + '/' + fromdate[0] + '/' + fromdate[2]; // mm/dd/yyyy format for validation
                fromdate = fromdate[2] + "-" + fromdate[1] + "-" + fromdate[0];


                var todate = loginend.split("/");
                var to_Date = todate[1] + '/' + todate[0] + '/' + todate[2]; // mm/dd/yyyy format for validation
                todate = todate[2] + "-" + todate[1] + "-" + todate[0];

                var diffDates = Date.parse(to_Date) - Date.parse(from_Date);
                var CurrentDate = new Date();
                var givenFromDate = new Date(fromdate);
                var givenToDate = new Date(todate);

                if (loginstart == "" || loginend == "") {
                    $('#startdatepicker').css('border-color', 'red');
                    $('#enddatepicker').css('border-color', 'red');
                    raiseValidationError(Messages[sidebarControlName].inputValidation)
                    return;

                } else if (givenFromDate > CurrentDate || givenToDate > CurrentDate) {

                    raiseValidationError(Messages[sidebarControlName].invalidDates)
                    return;


                } else if (diffDates < 0) {

                    raiseValidationError(Messages[sidebarControlName].ToDateValidate)
                    return;
                } else {
                    spinOn();
                    $('#startdatepicker').css('border-color', '');
                    $('#enddatepicker').css('border-color', '');

                    if (username == "") {
                        username = "all";
                    }
                    $.ajax({
                        type: "POST",
                        data: JSON.stringify({
                            "username": username,
                            "login": loginstart,
                            "logout": loginend

                        }),
                        contentType: "application/json",

                        url: auditReport,
                        crossDomain: true,
                        dataType: "json",
                        error: function(err) {
                            spinOff();
                            raiseValidationError(Messages[sidebarControlName].nodeNotRunning)
                        },
                        success: function(data) {

                         
                            spinOff();
                            if (data.length <= 0) {
                                raiseSuccessMessage(Messages[sidebarControlName].noData)

                            } else {
                              
                                
                                $("#auditModal").modal("show");


                                data.forEach(function(user) {
                                    delete user["id"]
									var temp_login = user.login.split('T')[0] + " " + user.login.split('T').pop().split('.')[0];
                                    user.login = new Date (temp_login).toLocaleString('en-GB').replace(",", "");
									
                                    var logoutdate = "",
                                        ip = "";
                                    
									if (user.logout != null) {
                                        user.logout = new Date(user.logout.split('T')[0] + " " + user.logout.split('T').pop().split('.')[0]).toLocaleString('en-GB').replace(",", "");
                                    }else{
										if(l_logindatetime != user.login){
											
										var d = new Date(temp_login);
										d.setSeconds(d.getSeconds()+120);
										user.logout = d.toLocaleString('en-GB').replace(",", "");
										}
									}
									
                                   if (user.ip != null) {
									   user.ip = user.ip.toString()
                                        
                                    }


                                });
                                renderDatatable(data);

                                raiseSuccessMessage(Messages[sidebarControlName].ReportSuccess)
                            }
                        }
                    })

                }
            });
        }

        var buildUI = function buildUI() {
            var options = {
                messages: Messages,
            };
            $cardSelector.append(cardTemplate.render(options));
            $dateFrom = $("#startdatepicker").datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                todayHighlight: true,
                todayBtn: 'linked',
            }).datepicker("setDate", new Date());;
            $dateTo = $("#enddatepicker").datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                todayHighlight: true,
                todayBtn: 'linked'
            }).datepicker("setDate", new Date());
        };


    });