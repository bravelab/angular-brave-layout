(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name app [ngBraveLayout]
   * @description Tools
   */
  angular
    .module('ngBraveLayout', [])
    .value('version', '0.0.6');


})();

(function() {
  'use strict';

  angular
    .module('ngBraveLayout')
    .constant('layoutConfig', {
      templates: {
        directives: {
        }
      }
    });
}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .factory('lazyScript', function ($q) {

      var cache = {};

      function isPending(scriptName) {
        return (cache.hasOwnProperty(scriptName) && cache[scriptName].promise && cache[scriptName].promise.$$state.pending);
      }

      function isRegistered(scriptName) {
        return cache.hasOwnProperty(scriptName);
      }

      function loadScript(scriptName) {
        if (!cache[scriptName]) {
          cache[scriptName] = $q.defer();
          var el = document.createElement('script');
          el.onload = function (script) {
            console.log('script is lazy loaded:', scriptName);
            cache[scriptName].resolve(scriptName);
          };
          el.src = scriptName;
          var x = document.getElementsByTagName('script')[0];
          x.parentNode.insertBefore(el, x);

        }
        return cache[scriptName].promise;

      }

      function register(scriptName) {
        if (isPending(scriptName)) {
          return cache[scriptName].promise;
        }
        if (isRegistered(scriptName)) {
          return $q.resolve(scriptName);
        } else {
          var dfd = $q.defer();

          loadScript(scriptName).then(function () {
            dfd.resolve(scriptName);
          });

          return dfd.promise;

        }
      }

      return {
        register: function (scripts) {

          var dfd = $q.defer();
          var promises = [];
          if (angular.isString(scripts)) {
            scripts = [scripts];
          }

          angular.forEach(scripts, function (script) {
            promises.push(register(script));
          });

          $q.all(promises).then(function (resolves) {
            dfd.resolve(resolves);
          });

          return dfd.promise;

        }
      };
    });

}());

(function () {
  'use strict';


  angular
    .module('ngBraveLayout')
    .factory('SmartCss', function ($rootScope, $timeout) {

      var sheet = (function () {
        // Create the <style> tag
        var style = document.createElement('style');

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(''));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
      })();

      var _styles = {};

      var SmartCss = {
        writeRule: function (selector) {
          SmartCss.deleteRuleFor(selector);
          if (_.has(_styles, selector)) {
            var css = selector + '{ ' + _.map(_styles[selector], function (v, k) {
              return k + ':' + v + ';';
            }).join(' ') + '}';
            sheet.insertRule(css, _.size(_styles) - 1);
          }
        },
        add: function (selector, property, value, delay) {
          if (!_.has(_styles, selector)) {
            _styles[selector] = {};
          }

          if (typeof value === 'undefined' || value === null || value === '') {
            delete _styles[selector][property];
          } else {
            _styles[selector][property] = value;
          }

          if (_.keys(_styles[selector]).length === 0) {
            delete _styles[selector];
          }

          if (!delay) {
            delay = 0;
          }

          $timeout(function () {
            SmartCss.writeRule(selector);
          }, delay);

        },
        remove: function (selector, property, delay) {
          SmartCss.add(selector, property, null, delay);
        },
        deleteRuleFor: function (selector) {
          _(sheet.rules).forEach(function (rule, idx) {
            if (rule.selectorText === selector) {
              sheet.deleteRule(idx);
            }
          });
        },
        appViewSize: null
      };

      $rootScope.$on('$smartContentResize', function (event, data) {
        SmartCss.appViewSize = data;
      });

      return SmartCss;

    });


}());



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
            element.find('h1').append('<span translate>' + item + '</span>');
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('braveStateBreadcrumbs', function ($rootScope, $state, $compile) {

      var home = '<a translate ui-sref="app.home">Home</a>';

      return {
        restrict: 'EA',
        replace: true,
        template: '<ol class="breadcrumb">' + home + '</ol>',
        link: function (scope, element) {

          function setBreadcrumbs(breadcrumbs) {
            var html = '<li>' + home + '</li>';

            angular.forEach(breadcrumbs, function (val, key) {
              html += '<li><a translate ui-sref="' + val[0] + '">' + val[1] + '</a></li>';
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

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('braveStateModuleTitle', function ($rootScope, $state, $compile, $translate) {

      var home = '';

      return {
        restrict: 'EA',
        replace: true,
        template: '<div><h1 class="page-title txt-color-blueDark"></h1></div>',
        link: function (scope, element) {

          function setBreadcrumbs(breadcrumbs) {
            var html = '';

            angular.forEach(breadcrumbs, function (val, key) {
              html += '<a ui-sref="' + val[0] + '" style="margin-right: 5px;" translate>' + val[1] + '</a>';
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

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('dismisser', function () {
      return {
        restrict: 'A',
        compile: function (element) {
          element.removeAttr('dismisser data-dissmiser');
          var closer = '<button class="close">&times;</button>';
          element.prepend(closer);
          element.on('click', '>button.close', function () {
            element.fadeOut('fast', function () {
              $(this).remove();
            });
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('fullScreen', function () {
      return {
        restrict: 'A',
        link: function (scope, element) {
          var $body = $('body');
          var toggleFullSceen = function (e) {
            if (!$body.hasClass('full-screen')) {
              $body.addClass('full-screen');
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
              } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
              }
            } else {
              $body.removeClass('full-screen');
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              }
            }
          };

          element.on('click', toggleFullSceen);

        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('hrefVoid', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attributes) {
          element.attr('href', '#');
          element.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
          });
        }
      };
    });

}());

/**
 * Jarvis Widget Directive
 *
 *    colorbutton="false"
 *    editbutton="false"
 togglebutton="false"
 deletebutton="false"
 fullscreenbutton="false"
 custombutton="false"
 collapsed="true"
 sortable="false"
 *
 *
 */
(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('jarvisWidget', function ($rootScope) {
      return {
        restrict: 'A',
        compile: function (element, attributes) {
          if (element.data('widget-color')) {
            element.addClass('jarviswidget-color-' + element.data('widget-color'));
          }

          element.find('.widget-body').prepend('<div class="jarviswidget-editbox"><input class="form-control" type="text"></div>');
          element.addClass('jarviswidget');
          $rootScope.$emit('jarvisWidgetAdded', element);
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('minifyMenu', function () {
      return {
        restrict: 'A',
        link: function (scope, element) {
          var $body = $('body');
          var minifyMenu = function () {
            if (!$body.hasClass('menu-on-top')) {
              $body.toggleClass('minified');
              $body.removeClass('hidden-menu');
              $('html').removeClass('hidden-menu-mobile-lock');
            }
          };

          element.on('click', minifyMenu);
        }
      };
    });

}());

(function () {
  'use strict';

  /*
   * Directive for toggling a ng-model with a button
   * Source: https://gist.github.com/aeife/9374784
   */
  angular
    .module('ngBraveLayout')
    .directive('radioToggle', function ($log) {
      return {
        scope: {
          model: '=ngModel',
          value: '@value'
        },
        link: function (scope, element, attrs) {
          element.parent().on('click', function () {
            scope.model = scope.value;
            scope.$apply();
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('reloadState', function ($rootScope) {
      return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
          tElement.removeAttr('reload-state data-reload-state');
          tElement.on('click', function (e) {
            $rootScope.$state.transitionTo($rootScope.$state.current, $rootScope.$stateParams, {
              reload: true,
              inherit: false,
              notify: true
            });
            e.preventDefault();
          });
        }
      };
    });

}());

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

(function () {
  'use strict';


  angular
    .module('ngBraveLayout')
    .directive('searchMobile', function () {
      return {
        restrict: 'A',
        compile: function (element, attributes) {
          element.removeAttr('search-mobile data-search-mobile');

          element.on('click', function (e) {
            $('body').addClass('search-mobile');
            e.preventDefault();
          });

          $('#cancel-search-js').on('click', function (e) {
            $('body').removeClass('search-mobile');
            e.preventDefault();
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('toggleShortcut', function ($log, $timeout) {

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

/**
 * DETECT MOBILE DEVICES
 * Description: Detects mobile device - if any of the listed device is
 *
 * detected class is inserted to <tElement>.
 *
 *  (so far this is covering most hand held devices)
 */
(function () {
  'use strict';


  angular.module('ngBraveLayout').directive('smartDeviceDetect', function () {
    return {
      restrict: 'A',
      compile: function (tElement, tAttributes) {
        tElement.removeAttr('smart-device-detect data-smart-device-detect');

        var isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

        tElement.toggleClass('desktop-detected', !isMobile);
        tElement.toggleClass('mobile-detected', isMobile);

      }
    };
  });

}());

/**
 *
 * Description: Directive utilizes FastClick library.
 *
 *
 * FastClick is a simple, easy-to-use library for eliminating the
 * 300ms delay between a physical tap and the firing of a click event on mobile browsers.
 * FastClick doesn't attach any listeners on desktop browsers.
 * @link: https://github.com/ftlabs/fastclick
 *
 * On mobile devices 'needsclick' class is attached to <tElement>
 *
 */
(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('smartFastClick', function () {
      return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
          tElement.removeAttr('smart-fast-click data-smart-fast-click');

          FastClick.attach(tElement);
          if (!FastClick.notNeeded()) {
            tElement.addClass('needsclick');
          }
        }
      };
    });

}());

/*
(function () {
 'use strict';

 angular.module('ngBraveLayout').directive('smartFitAppView', function ($rootScope, SmartCss) {
 return {
 restrict: 'A',
 compile: function (element, attributes) {
 element.removeAttr('smart-fit-app-view data-smart-fit-app-view leading-y data-leading-y');

 var leadingY = attributes.leadingY ? parseInt(attributes.leadingY) : 0;

 var selector = attributes.smartFitAppView;

 if(SmartCss.appViewSize && SmartCss.appViewSize.height){
 var height =  SmartCss.appViewSize.height - leadingY < 252 ? 252 :  SmartCss.appViewSize.height - leadingY;
 SmartCss.add(selector, 'height', height+'px');
 }

 var listenerDestroy = $rootScope.$on('$smartContentResize', function (event, data) {
 var height = data.height - leadingY < 252 ? 252 : data.height - leadingY;
 SmartCss.add(selector, 'height', height+'px');
 });

 element.on('$destroy', function () {
 listenerDestroy();
 SmartCss.remove(selector, 'height');
 });


 }
 }
 });
 }());
*/

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
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
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('smartLayout', function ($rootScope, $timeout, $interval, $q, SmartCss, APP_CONFIG) {

      var _debug = 0;

      function getDocHeight() {
        var D = document;
        return Math.max(
          D.body.scrollHeight, D.documentElement.scrollHeight,
          D.body.offsetHeight, D.documentElement.offsetHeight,
          D.body.clientHeight, D.documentElement.clientHeight
        );
      }

      var initialized = false,
        initializedResolver = $q.defer();
      initializedResolver.promise.then(function () {
        initialized = true;
      });

      var $window = $(window),
        $document = $(document),
        $html = $('html'),
        $body = $('body'),
        $navigation,
        $menu,
        $ribbon,
        $footer,
        $contentAnimContainer;


      (function cacheElements() {
        $navigation = $('#header');
        $menu = $('#left-panel');
        $ribbon = $('#ribbon');
        $footer = $('.page-footer');
        if (_.every([$navigation, $menu, $ribbon, $footer], function ($it) {
          return angular.isNumber($it.height());
        })) {
          initializedResolver.resolve();
        } else {
          $timeout(cacheElements, 100);
        }
      })();

      (function applyConfigSkin() {
        if (APP_CONFIG.smartSkin) {
          $body.removeClass(_.pluck(APP_CONFIG.skins, 'name').join(' '));
          $body.addClass(APP_CONFIG.smartSkin);
        }
      })();


      return {
        priority: 2014,
        restrict: 'A',
        compile: function (tElement, tAttributes) {
          tElement.removeAttr('smart-layout data-smart-layout');

          var appViewHeight = 0,
            appViewWidth = 0,
            calcWidth,
            calcHeight,
            deltaX,
            deltaY;

          var forceResizeTrigger = false;

          function resizeListener() {

//                    full window height appHeight = Math.max($menu.outerHeight() - 10, getDocHeight() - 10);

            var menuHeight = $body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.height() : 0;
            var menuWidth = !$body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.width() + $menu.offset().left : 0;

            var $content = $('#content');
            var contentXPad = $content.outerWidth(true) - $content.width();
            var contentYPad = $content.outerHeight(true) - $content.height();


            calcWidth = $window.width() - menuWidth - contentXPad;
            calcHeight = $window.height() - menuHeight - contentYPad - $navigation.height() - $ribbon.height() - $footer.height();

            deltaX = appViewWidth - calcWidth;
            deltaY = appViewHeight - calcHeight;
            if (Math.abs(deltaX) || Math.abs(deltaY) || forceResizeTrigger) {

              $rootScope.$broadcast('$smartContentResize', {
                width: calcWidth,
                height: calcHeight,
                deltaX: deltaX,
                deltaY: deltaY
              });
              appViewWidth = calcWidth;
              appViewHeight = calcHeight;
              forceResizeTrigger = false;
            }
          }


          var looping = false;
          $interval(function () {
            if (looping) {
              loop();
            }
          }, 300);

          var debouncedRun = _.debounce(function () {
            run(300);
          }, 300);

          function run(delay) {
            initializedResolver.promise.then(function () {
              attachOnResize(delay);
            });
          }

          run(10);

          function detachOnResize() {
            looping = false;
          }

          function attachOnResize(delay) {
            $timeout(function () {
              looping = true;
            }, delay);
          }

          function loop() {
            $body.toggleClass('mobile-view-activated', $window.width() < 979);

            if ($window.width() < 979) {
              $body.removeClass('minified');
            }

            resizeListener();
          }

          function handleHtmlId(toState) {
            if (toState.data && toState.data.htmlId) {
              $html.attr('id', toState.data.htmlId);
            } else {
              $html.removeAttr('id');
            }
          }

          $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            handleHtmlId(toState);
            detachOnResize();
          });

          // initialized with 1 cause we came here with one $viewContentLoading request
          var viewContentLoading = 1;
          $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
            viewContentLoading++;
          });

          $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            forceResizeTrigger = true;
          });

          $rootScope.$on('$viewContentLoaded', function (event) {
            viewContentLoading--;

            if (viewContentLoading === 0 && initialized) {
              debouncedRun();
            }
          });
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('smartPageTitle', function ($rootScope, $timeout) {
      return {
        restrict: 'A',
        compile: function (element, attributes) {
          element.removeAttr('smart-page-title data-smart-page-title');

          var defaultTitle = attributes.smartPageTitle;
          var listener = function (event, toState, toParams, fromState, fromParams) {
            var title = defaultTitle;
            if (toState.data && toState.data.title) {
              title = toState.data.title + ' | ' + title;
            }
            // Set asynchronously so page changes before title does
            $timeout(function () {
              $('html head title').text(title);
            });
          };

          $rootScope.$on('$stateChangeStart', listener);
        }
      };
    });

}());

(function () {
  'use strict';


  angular
    .module('ngBraveLayout')
    .directive('smartPopoverHtml', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attributes) {
          var options = {};
          options.content = attributes.smartPopoverHtml;
          options.placement = attributes.popoverPlacement || 'top';
          options.html = true;
          options.trigger = attributes.popoverTrigger || 'click';
          options.title = attributes.popoverTitle || attributes.title;
          element.popover(options);
        }
      };
    });

}());

(function () {
  'use strict';

  angular
    .module('ngBraveLayout')
    .directive('smartRouterAnimationWrap', function ($rootScope, $timeout) {
      return {
        restrict: 'A',
        compile: function (element, attributes) {
          element.removeAttr('smart-router-animation-wrap data-smart-router-animation-wrap wrap-for data-wrap-for');
          element.addClass('router-animation-container');

          var $loader = $('<div class="router-animation-loader"><i class="fa fa-gear fa-4x fa-spin"></i></div>')
            .css({
              position: 'absolute',
              top: 50,
              left: 10
            }).hide().appendTo(element);

          var animateElementSelector = attributes.wrapFor;
          var viewsToMatch = attributes.smartRouterAnimationWrap.split(/\s/);
          var needRunContentViewAnimEnd = false;

          function contentViewAnimStart() {
            needRunContentViewAnimEnd = true;
            element.css({
              height: element.height() + 'px',
              overflow: 'hidden'
            }).addClass('active');
            $loader.fadeIn();

            $(animateElementSelector).addClass('animated faster fadeOutDown');
          }

          function contentViewAnimEnd() {
            if (needRunContentViewAnimEnd) {
              element.css({
                height: 'auto',
                overflow: 'visible'
              }).removeClass('active');


              $(animateElementSelector).addClass('animated faster fadeInUp');

              needRunContentViewAnimEnd = false;

              $timeout(function () {
                $(animateElementSelector).removeClass('animated');
              }, 10);
            }
            $loader.fadeOut();
          }


          var destroyForStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var isAnimRequired = _.any(viewsToMatch, function (view) {
              return _.has(toState.views, view) || _.has(fromState.views, view);
            });
            if (isAnimRequired) {
              contentViewAnimStart();
            }
          });

          var destroyForEnd = $rootScope.$on('$viewContentLoaded', function (event) {
            contentViewAnimEnd();
          });

          element.on('$destroy', function () {
            destroyForStart();
            destroyForEnd();

          });

        }
      };
    });

}());

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

(function () {
  'use strict';


  angular.module('ngBraveLayout').directive('stateBreadcrumbs', function ($rootScope, $state) {

    return {
      restrict: 'EA',
      replace: true,
      template: '<ol class="breadcrumb"><li translate>Home</li></ol>',
      link: function (scope, element) {

        function setBreadcrumbs(breadcrumbs) {
          var html = '<li translate>Home</li>';
          angular.forEach(breadcrumbs, function (crumb) {
            html += '<li translate>' + crumb + '</li>';
          });
          element.html(html);
        }

        function fetchBreadcrumbs(stateName, breadcrunbs) {

          var state = $state.get(stateName);

          if (state && state.data && state.data.title && breadcrunbs.indexOf(state.data.title) === -1) {
            breadcrunbs.unshift(state.data.title);
          }

          var parentName = stateName.replace(/.?\w+$/, '');
          if (parentName) {
            return fetchBreadcrumbs(parentName, breadcrunbs);
          } else {
            return breadcrunbs;
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

(function () {
  'use strict';


  angular
    .module('ngBraveLayout')
    .directive('toggleMenu', function () {
      return {
        restrict: 'A',
        link: function (scope, element) {
          var $body = $('body');

          var toggleMenu = function () {
            if (!$body.hasClass('menu-on-top')) {
              $('html').toggleClass('hidden-menu-mobile-lock');
              $body.toggleClass('hidden-menu');
              $body.removeClass('minified');
            } else if ($body.hasClass('menu-on-top') && $body.hasClass('mobile-view-activated')) {
              $('html').toggleClass('hidden-menu-mobile-lock');
              $body.toggleClass('hidden-menu');
              $body.removeClass('minified');
            }
          };

          element.on('click', toggleMenu);

          scope.$on('requestToggleMenu', function () {
            toggleMenu();
          });
        }
      };
    });

}());

(function () {
  'use strict';


  angular.module('ngBraveLayout').directive('widgetGrid', function ($rootScope, $compile, $q, $state, $timeout) {

    var jarvisWidgetsDefaults = {
      grid: 'article',
      widgets: '.jarviswidget',
      localStorage: true,
      deleteSettingsKey: '#deletesettingskey-options',
      settingsKeyLabel: 'Reset settings?',
      deletePositionKey: '#deletepositionkey-options',
      positionKeyLabel: 'Reset position?',
      sortable: true,
      buttonsHidden: false,
      // toggle button
      toggleButton: true,
      toggleClass: 'fa fa-minus | fa fa-plus',
      toggleSpeed: 200,
      onToggle: function () {
      },
      // delete btn
      deleteButton: true,
      deleteMsg: 'Warning: This action cannot be undone!',
      deleteClass: 'fa fa-times',
      deleteSpeed: 200,
      onDelete: function () {
      },
      // edit btn
      editButton: true,
      editPlaceholder: '.jarviswidget-editbox',
      editClass: 'fa fa-cog | fa fa-save',
      editSpeed: 200,
      onEdit: function () {
      },
      // color button
      colorButton: true,
      // full screen
      fullscreenButton: true,
      fullscreenClass: 'fa fa-expand | fa fa-compress',
      fullscreenDiff: 3,
      onFullscreen: function () {
      },
      // custom btn
      customButton: false,
      customClass: 'folder-10 | next-10',
      customStart: function () {
        console.log('Hello you, this is a custom button...');
      },
      customEnd: function () {
        console.log('bye, till next time...');
      },
      // order
      buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
      opacity: 1.0,
      dragHandle: '> header',
      placeholderClass: 'jarviswidget-placeholder',
      indicator: true,
      indicatorTime: 600,
      ajax: true,
      timestampPlaceholder: '.jarviswidget-timestamp',
      timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
      refreshButton: true,
      refreshButtonClass: 'fa fa-refresh',
      labelError: 'Sorry but there was a error:',
      labelUpdated: 'Last Update:',
      labelRefresh: 'Refresh',
      labelDelete: 'Delete widget:',
      afterLoad: function () {
      },
      rtl: false, // best not to toggle this!
      onChange: function () {

      },
      onSave: function () {

      },
      ajaxnav: true

    };

    var dispatchedWidgetIds = [];
    var setupWaiting = false;
    var debug = 1;


    var initDropdowns = function (widgetIds) {
      angular.forEach(widgetIds, function (wid) {
        $('#' + wid + ' [data-toggle="dropdown"]').each(function () {
          var $parent = $(this).parent();
          // $(this).removeAttr('data-toggle');
          if (!$parent.attr('dropdown')) {
            $(this).removeAttr('href');
            $parent.attr('dropdown', '');
            var compiled = $compile($parent)($parent.scope());
            $parent.replaceWith(compiled);
          }
        });
      });
    };

    var setupWidgets = function (element, widgetIds) {

      if (!setupWaiting) {

        if (_.intersection(widgetIds, dispatchedWidgetIds).length !== widgetIds.length) {

          dispatchedWidgetIds = _.union(widgetIds, dispatchedWidgetIds);

//                    console.log('setupWidgets', debug++);

          element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
          element.jarvisWidgets(jarvisWidgetsDefaults);
          initDropdowns(widgetIds);
        }

      } else {
        if (!setupWaiting) {
          setupWaiting = true;
          $timeout(function () {
            setupWaiting = false;
            setupWidgets(element, widgetIds);
          }, 200);
        }
      }

    };

    var destroyWidgets = function (element, widgetIds) {
      element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
      dispatchedWidgetIds = _.xor(dispatchedWidgetIds, widgetIds);
    };

    var jarvisWidgetAddedOff,
      $viewContentLoadedOff,
      $stateChangeStartOff;

    return {
      restrict: 'A',
      compile: function (element) {

        element.removeAttr('widget-grid data-widget-grid');

        var widgetIds = [];

        $viewContentLoadedOff = $rootScope.$on('$viewContentLoaded', function (event, data) {
          $timeout(function () {
            setupWidgets(element, widgetIds);
          }, 100);
        });


        $stateChangeStartOff = $rootScope.$on('$stateChangeStart',
          function (event, toState, toParams, fromState, fromParams) {
            jarvisWidgetAddedOff();
            $viewContentLoadedOff();
            $stateChangeStartOff();
            destroyWidgets(element, widgetIds);
          });

        jarvisWidgetAddedOff = $rootScope.$on('jarvisWidgetAdded', function (event, widget) {
          if (widgetIds.indexOf(widget.attr('id')) === -1) {
            widgetIds.push(widget.attr('id'));
            $timeout(function () {
              setupWidgets(element, widgetIds);
            }, 100);
          }
//                    console.log('jarvisWidgetAdded', widget.attr('id'));
        });

      }
    };
  });

}());
