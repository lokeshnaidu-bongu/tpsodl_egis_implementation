/**
 * Configurable Sidebar component for displaying Hello-smallworld panel.
 * @module HelloSmallworld
 * @requires jQuery
 * @requires underscore
 * @requires Hogan
 * @requires PubSub
 */
define([
        'jquery',
        'underscore',
        'i18n!custom/nls/messages',
        'hogan',
        'comms',
        "OpenLayers3",
        'popovers',
        'map-helper',
        "comms",
        'map-loader',
        'map-core-component/pubsub',
        'datatables',
        'stepper'
    ],
    function NewServiceConnection($, _, Messages, hogan, CommsLayer, OpenLayers3, popovers, mapHelper, comms, MapLoader) {
        'use strict';
        var objectUrn,
            options,
            objects,
            html = '',
            sidebarControlName = 'tpsodl_scroll_for_sidebar_items',
            $cardSelector;
        var selectedZone,
            zoneNameGotByZoneId,
            selectedPoleORBPNumber,
            selectedDeliveryPoint,
            selectedPhase,
            selectedDeliveryPointForUpdate,
            selectedPhaseForUpdate,
            selectedVoltage,
            ordersDataTable;
        var dragInteraction,
            draw;

        var t = {
            strokeWidth: 5,
            strokeColor: "rgba(255, 153, 0, 0.75)"
        };

        var selectedOrderData;
        var selectedRowNumber;
        var updatePropDetails;
        var mapRef,

            mapName = "main_map";
        var vectorLayer;
        var latLngForSDPInsertion = "";
        var seletedFeatureOnmapForNSCSidebar;
        var isSidebarOpenOfNSC = !0;
        var selectedBtn;
        var draw;
        var modal;
        var modalFororderFinishFromMap;
        var tab_id;
        var clickedZoneWiseOrders;
        var modalFororderForNscMap;
        var proposalIdOfProvidedBPNumber;
        var selectedBPOrders;
        var seletedFeatureOnmapForAddCutomer;
        var voltageFromproposalData;
        var selectedBpProposalId;
        var selectedBpVoltage;
        var selectedFeatureId;
        var selectedFeatureIdForUpdate;
        var lastUpdatedBy;
        var usertype = "";
        /**
         * @memberof module:HelloSmallworld
         * @private
         * @listens ViewerEvents.setTraceStartingPoint
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
                    $("ul.controls-list li a#tpsodl_scroll_for_sidebar_items").css("display", "none")

                }
            });
            $.subscribe("userData", function(user) {

                if (user.security_roles.indexOf("gss.admin") >= 0) {
                    usertype = "admin"
                    $("#tpsodl-sidebar-control-item-menu-dropdown a#tpsodl_user_audit").css("display", "")
                    $("#tpsodl-sidebar-control-item-menu-dropdown a#tpsodl_lucene_build").css("display", "")



                } else {

                    $("#tpsodl-sidebar-control-item-menu-dropdown a#tpsodl_user_audit").css("display", "none")
                    $("#tpsodl-sidebar-control-item-menu-dropdown a#tpsodl_lucene_build").css("display", "none")

                }

            })

            $.subscribe('leavingSidebar', function(target) {
                if (target === sidebarControlName) {}
            });

            $.subscribe('gotoSidebar', function(target) {
                if (target === sidebarControlName) {

                }
            });

        };

        eventSubscribe();

        var initialise = function initialise(selector) {
            $cardSelector = selector;
            buildUI();
        };

        var buildUI = function buildUI() {
            options = {
                messages: Messages,
            };

            initialiseNSC();

        };

        var initialiseNSC = function initialiseNSC() {

            $("#open-tpsodl-menu-slider").click(function() {
                if (document.getElementById("tpsodl-menu-slider-sidebar-items").style.width == "" || document.getElementById("tpsodl-menu-slider-sidebar-items").style.width == "0%") {
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.width = "54.5%";
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.height = "60px";
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.display = "";
                } else {
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.width = "0%";
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.height = "60px";
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.display = "";
                }

                $("#close-tpsodl-menu-slider").click(function() {
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.width = "0%";
                });
                var selectedMenuSidebarCtrlBtn;
                $(".menulistitem").click(function() {
                    if (selectedMenuSidebarCtrlBtn)
                        selectedMenuSidebarCtrlBtn.removeClass("tpsodl-menu-btn-selected");
                    if (!$(this).hasClass("tpsodl-menu-btn-selected")) {
                        selectedMenuSidebarCtrlBtn = $(this);
                        openSidebarFromMenuItemBtn($(this)[0].id);
                    }
                });
                var openSidebarFromMenuItemBtn = function(sidebarId) {
                    selectedMenuSidebarCtrlBtn.addClass("tpsodl-menu-btn-selected");
                    $.publish("openSidebarToItem", [sidebarId]);
                    document.getElementById("tpsodl-menu-slider-sidebar-items").style.width = "0%";
                };


            });
            $("#tpsodl-sidebar-control-item-menu-search").keyup(function() {
                var input,
                    filter,
                    ul,
                    li,
                    a,
                    i;
                input = document.getElementById("tpsodl-sidebar-control-item-menu-search");
                filter = input.value.toUpperCase();
                var div = document.getElementById("tpsodl-sidebar-control-item-menu-dropdown");
                a = div.getElementsByTagName("a");
                for (i = 0; i < a.length; i++) {
                    var txtValue = a[i].textContent || a[i].innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {

                        if ((a[i].id == "tpsodl_user_audit"||a[i].id == "tpsodl_lucene_build")&& usertype != "admin") {
                            a[i].style.display = "none";
                        } else {
                            a[i].style.display = "";
                        }

                    } else {
                        a[i].style.display = "none";
                    }
                }
            });

        }

        var api = {};
        /* test-code */
        api.__TEST_ONLY__ = {};
        /* end-test-code */
        return api;
    });