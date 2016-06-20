(function () {
  'use strict';


  angular.module('ngBraveLayout').directive('stateNamedBreadcrumbs', function ($rootScope, $state, $compile) {

    var home = '<a ui-sref="app.home">Home</a>';

    return {
      restrict: 'EA',
      replace: true,
      template: '<ol class="breadcrumb">' + home + '</ol>',
      link: function (scope, element) {

        function setBreadcrumbs(breadcrumbs) {
          var html = '<li>' + home + '</li>';

          angular.forEach(breadcrumbs, function (val, key) {
            html += '<li><a ui-sref="' + val[0] + '">' + val[1] + '</a></li>';
          });

          var template = angular.element(html);
          var linkFn = $compile(template);
          var item = linkFn(scope);
          element.html(item);

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
