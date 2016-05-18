(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('smartTooltipHtml', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attributes) {
          element.tooltip({
            placement: attributes.tooltipPlacement || 'top',
            html: true,
            title: attributes.smartTooltipHtml
          });
        }
      };
    });

}());
