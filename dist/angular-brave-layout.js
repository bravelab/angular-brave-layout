(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name app [ngBraveLayout]
   * @description Tools
   */
  angular
    .module('ngBraveLayout', [])
    .value('version', '0.0.1');

})();

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('bigBreadcrumbs', function () {
      return {
        restrict: 'EA',
        replace: true,
        template: '<div><h1 class="page-title txt-color-blueDark"></h1></div>',
        scope: {
          items: '=',
          icon: '@'
        },
        link: function (scope, element) {
          var first = _.first(scope.items);

          var icon = scope.icon || 'home';
          element.find('h1').append('<i class="fa-fw fa fa-' + icon + '"></i>' + first);
          _.rest(scope.items).forEach(function (item) {
            element.find('h1').append('<span>>' + item + '</span>');
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular.module('ngBraveLayout')
    .directive('smartInclude', function () {
      return {
        replace: true,
        restrict: 'A',
        templateUrl: function (element, attr) {
          return attr.smartInclude;
        },
        compile: function (element) {
          element[0].className = element[0].className.replace(/placeholder[^\s]+/g, '');
        }
      };
    }
  );

}());
