(function () {
  'use strict';

  angular.module('app').directive('toggleShortcut', function ($log, $timeout) {

    var initDomEvents = function ($element) {

      var shortcutDropdown = $('#shortcut');

      $element.on('click', function () {

        if (shortcutDropdown.is(':visible')) {
          shortcutButtonsHide();
        } else {
          shortcutButtonsShow();
        }

      });

      shortcutDropdown.find('a').click(function (e) {
        e.preventDefault();
        window.location = $(this).attr('href');
        setTimeout(shortcutButtonsHide, 300);
      });


      // SHORTCUT buttons goes away if mouse is clicked outside of the area
      $(document).mouseup(function (e) {
        if (shortcutDropdown && !shortcutDropdown.is(e.target) && shortcutDropdown.has(e.target).length === 0) {
          shortcutButtonsHide();
        }
      });

      // SHORTCUT ANIMATE HIDE
      function shortcutButtonsHide() {
        shortcutDropdown.animate({
          height: 'hide'
        }, 300, 'easeOutCirc');
        $('body').removeClass('shortcut-on');
      }

      // SHORTCUT ANIMATE SHOW
      function shortcutButtonsShow() {
        shortcutDropdown.animate({
          height: 'show'
        }, 200, 'easeOutCirc');
        $('body').addClass('shortcut-on');
      }
    };

    var link = function ($scope, $element) {
      $timeout(function () {
        initDomEvents($element);
      });
    };

    return {
      restrict: 'EA',
      link: link
    };
  });

}());
