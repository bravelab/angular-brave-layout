(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('braveStateTitle', function ($rootScope, $state, $timeout, $translate) {
      return {
        restrict: 'A',
        compile: function (element, attributes) {
          element.removeAttr('data-brave-state-title');

          function setTitle(title) {
            $timeout(function () {
              $('html head title').text(title);
            });
          }

          function fetchTitles(stateName, titlesList) {
            var state = $state.get(stateName);
            if (state && state.data && state.data.title && titlesList.indexOf(state.data.title) === -1) {
              titlesList.push(state.data.title);
            }

            var parentName = stateName.replace(/.?\w+$/, '');
            return parentName ? fetchTitles(parentName, titlesList) : titlesList;
          }

          function processState(state) {
            var titles = fetchTitles(state.name, []);
            titles.push(attributes.braveStateTitle);
            setTitle(titles.join(' | '));
          }

          processState($state.current);

          $rootScope.$on('$stateChangeStart', function (event, state) {
            processState(state);
          });
        }
      };
    });
}());
