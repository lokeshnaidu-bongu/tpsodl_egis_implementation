/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery","underscore","comms","i18n!viewer/nls/messages","map-core-component/pubsub","help-inline"],function(a,b,c,d){"use strict";var e,f,g,h,i=!1,j=function(a,b){g=a,h=b,m()},k=function(){g&&o(function(a){e=a.types,f=a.recipients,p(),q()},function(a){l()})},l=function(){a.publish("raiseTempMessage",[d.sketching.errorRetrievingTaskTypes,{messageType:"warning"}])},m=function(){o(function(a){i=!0,k()},function(a){i=!1})},n=function(){return i},o=function(a,b){var d={service:"ejb/TasksLocal",method:"taskInfo",info:"types,recipients",json:"true"};c.getGSSRequest(d,a,b)},p=function(){var c,f;t(),g.empty(),e.length>1?(f=a('<option value="" default required>'+d.sketching.taskTypeLabel+"</option>"),g.append(f),b.each(e,function(b){c=a('<option value="'+b+'">'+b+"</option>"),g.append(c)})):(g.parent().css("display","none"),e.length&&g.append(a('<option value="'+e[0]+'" default required>'+e[0]+"</option>"))),g.change(function(){f&&f.remove(),t()}),g.click(function(){t()})},q=function(){var c,e;h.empty(),f.length>1?(e=a('<option value="" default required>'+d.sketching.recipientLabel+"</option>"),h.append(e),b.each(f,function(b){c=a('<option value="'+b+'">'+b+"</option>"),h.append(c)})):(h.parent().css("display","none"),f.length&&h.append(a('<option value="'+f[0]+'" default required>'+f[0]+"</option>"))),h.change(function(){e&&e.remove()}),h.click(function(){t()})},r=function(){var a=s(g,d.sketching.taskTypeNotSelected),b=s(h,d.sketching.recipientNotSelected);return a&&b},s=function(a,b){return!!a.val()||(a.addInlineHelp("error",b),a.parent().addClass("has-error"),!1)},t=function(){g.removeInlineHelp("error"),g.parent().removeClass("has-error"),h.removeInlineHelp("error"),h.parent().removeClass("has-error")},u={isTaskManagerConnected:n,initialise:j,createTaskTypes:p,createRecipients:q,validateTaskFields:r};return u.__TEST_ONLY__={connectToTaskManager:o,sendErrorConnectionMessage:l,initialiseTaskTypes:function(a,b){var c=o;o=function(a,b){b()},k(a,b),o=c}},u});