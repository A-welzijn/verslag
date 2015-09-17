'use strict';
(function (module) {
  try {
    module = angular.module('awelzijn.verslag');
  } catch (e) {
    module = angular.module('awelzijn.verslag', []);
  }
  module.directive('aWelzijnVerslag', ["aWelzijnVerslagService", "aWelzijnNotificationService", function (verslagService, notificationService) {
    return {
    		scope: {
        parentId: '=',
        type: '@'
    		},
    		templateUrl: 'templates/verslag.html',
    		controllerAs: 'ctrl',
    		controller: function ($scope, $element) {
        var ctrl = this;
        ctrl.nieuwVerslag = { datum: new Date() };
        ctrl.verslagen = {};
        ctrl.vandaag = new Date();
        ctrl.parentId = $scope.parentId;
        ctrl.type = $scope.type;

        ctrl.getVerslagen = function (type, parentId) {
          verslagService.listByType(parentId, type).then(function (response) {
            ctrl.verslagen = response.listOfVerslag;
          });
        };

        ctrl.verslagOpslaan = function () {
          ctrl.nieuwVerslag.datum.setHours(0, 0, 0, 0);
          ctrl.nieuwVerslag.medewerkerId = 20;
          verslagService.insertForType(ctrl.parentId, ctrl.type, { verslag: ctrl.nieuwVerslag }).then(function (response) {
            ctrl.verslagen.push(response.verslag);
            ctrl.resetVerslag();
            notificationService.notify("Verslag werd toegevoegd");
          });
        };

        ctrl.resetVerslag = function (id) {
          ctrl.verslagToevoegenZichtbaar = false;
          ctrl.nieuwVerslag.beschrijving = "";
          ctrl.nieuwVerslag.verslagDatum = new Date();
        };

        ctrl.updateVerslag = function (verslag) {
          verslag.medewerkerId = verslag.medewerker.id;
          verslagService.update(verslag.id, { "verslag": verslag });
          notificationService.notify("Verslag werd succevol aangepast");
        };

        ctrl.deleteVerslag = function (verslag, id) {
          verslagService.delete(verslag.id, ctrl.type).then(function (response) {
            var index = ctrl.verslagen.indexOf(verslag);
            ctrl.verslagen.splice(index, 1);
          })
        };

        ctrl.cancelVerslag = function (verslag, id) {
          for (var i = 0; i < ctrl.verslagen.length; i++) {
            if (ctrl.verslagen[i].id === verslag.id) {
              ctrl.verslagen[i] = ctrl.origineelVerslag;
              break;
            }
          }
        };

        ctrl.editVerslag = function (verslag) {
          ctrl.origineelVerslag = angular.copy(verslag);
        };

        $scope.$watch(function (scope) { return scope.parentId }, function (value) {
          if (value) {
            ctrl.parentId = value;
            ctrl.getVerslagen(ctrl.type, ctrl.parentId);
          }
        });
    		}
    };
  }]);
})();
