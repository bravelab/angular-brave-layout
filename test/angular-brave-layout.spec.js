(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ngBraveLayout
   * @description ngBraveLayout tests
   *
   */
  describe('ngBraveLayout module', function () {

    beforeEach(module('ngBraveLayout'));

    describe('value - version', function () {
      it('should return current version', inject(function (version) {
        expect(version).toEqual('0.0.6');
      }));
    });

  });
})();

