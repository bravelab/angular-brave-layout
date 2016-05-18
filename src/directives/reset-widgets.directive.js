(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('resetWidgets', function () {
      return {
        restrict: 'A',
        link: function (scope, element) {
          element.on('click', function () {
            $.smartMessageBox({
              title: '<i class="fa fa-refresh" style="color:green"></i> Clear Local Storage',
              content: 'Would you like to RESET all your saved widgets and clear LocalStorage?1',
              buttons: '[No][Yes]'
            }, function (ButtonPressed) {
              if (ButtonPressed === 'Yes' && localStorage) {
                localStorage.clear();
                location.reload();
              }
            });
          });
        }
      };
    });

}());
