/*! ElectricOfficeWeb 5.0.1 2021-06-16 */
define(["jquery"],function(a){"use strict";var b=function(b,c){var d,e,f=this,g=f.parent();g&&(e=g.find("span.help-inline"),e.length||(e=a('<span class="help-inline">'+c+"</span>"),g.append(e),d=g.parent(),d&&g.parent().addClass(b)))},c=function(a){var b,c,d=this,e=d.parent();e&&(c=e.find("span.help-inline"),c.length&&(b=e.parent(),b&&b.removeClass(a),c.remove()))};a.fn.extend({addInlineHelp:b,removeInlineHelp:c})});