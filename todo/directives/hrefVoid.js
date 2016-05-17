(function () {
  'use strict';

  angular.module('ngBraveLayout').directive('hrefVoid', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        element.attr('href', '#');
        element.on('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
        })
      }
    }
  });

}());
