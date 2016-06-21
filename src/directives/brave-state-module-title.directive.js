(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('braveStateModuleTitle', function ($rootScope, $state, $compile) {

      var home = '';

      return {
        restrict: 'EA',
        replace: true,
        template: '<div><h1 class="page-title txt-color-blueDark"></h1></div>',
        link: function (scope, element) {

          function setBreadcrumbs(breadcrumbs) {
            var html = '';

            angular.forEach(breadcrumbs, function (val, key) {
              html += '<a ui-sref="' + val[0] + '" style="margin-right: 5px;">' + val[1] + '</a>';
            });

            var template = angular.element(html);
            var linkFn = $compile(template);
            var item = linkFn(scope);

            element.find('h1').html(item);

          }

          function fetchBreadcrumbs(stateName, breadcrumbs) {
            var state = $state.get(stateName);
            if (state && state.data && state.data.title && breadcrumbs.indexOf(state.data.title) === -1) {
              breadcrumbs.unshift([stateName, state.data.title]);
            }

            var parentName = stateName.replace(/.?\w+$/, '');
            if (parentName) {
              return fetchBreadcrumbs(parentName, breadcrumbs);
            } else {
              return breadcrumbs;
            }
          }

          function processState(state) {
            var breadcrumbs;
            if (state.data && state.data.breadcrumbs) {
              breadcrumbs = state.data.breadcrumbs;
            } else {
              breadcrumbs = fetchBreadcrumbs(state.name, []);
            }
            setBreadcrumbs(breadcrumbs);
          }

          processState($state.current);

          $rootScope.$on('$stateChangeStart', function (event, state) {
            processState(state);
          });
        }
      };
    });

}());
