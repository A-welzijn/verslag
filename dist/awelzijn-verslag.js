'use strict';
(function (module) {
  try {
    module = angular.module('awelzijn.verslageditor');
  } catch (e) {
    module = angular.module('awelzijn.verslageditor', []);
  }
  module.directive('aWelzijnVerslagEditor', [function () {
   return {
			require: '?ngModel',
			link: function (scope, element, attrs, ngModel) {
				if (attrs.nieuwVerslag) {
					startEditing();
				}
				scope.$watch(attrs.editing, function (value) {
					if (value === true) {
						startEditing();
					} else if (value === false) {
						if (scope.ck) {
							scope.ck.destroy();
							scope.ck = null;
						}
					}
				});

				function startEditing() {
					scope.ck = CKEDITOR.replace(element[0],
					{
						toolbarGroups: [
							{ name: 'basicstyles' },
							{ name: 'paragraph', groups: ['list', 'align'] },
						],
						disableNativeSpellChecker: false,
						removePlugins: 'liststyle,tabletools,scayt,menubutton,contextmenu,elementspath',
						browserContextMenuOnCtrl: true
					});

					if (!ngModel) return;

					scope.ck.on('pasteState', function () {
						scope.$apply(function () {
							ngModel.$setViewValue(scope.ck.getData());
						});
					});

					ngModel.$render = function (value) {
						scope.ck.setData(ngModel.$viewValue);
					};
				}
			}
    };
  }]);
})();
;'use strict';
(function(module) {
  try {
    module = angular.module('awelzijn.verslagservice');
  } catch (e) {
    module = angular.module('awelzijn.verslagservice', []);
  }
  module.factory('aWelzijnVerslagService', ["AppService", "awelzijnHelperHttp", "AppConfig", function (appService, helper, appConfig) {
    		var url = appConfig.apiRoot + "verslag/";

		function _get(id) {
			return helper.get(url + id);
		}

		function _update(id, verslag) {
			return helper.put(url + id, verslag);
		}
		
		function _getBySoort(soort, id) {
			return helper.get(url + "soort/"+ soort + '/' + id);
		}

		function _delete(id, type) {
			return helper.delete(url + id +'/' + type);
		}

		function _listByType(parentId, type) {
			return helper.get(url + type + '/' + parentId);
		}

		function _insertForType(parentId, type, verslag) {
			return helper.post(url + type + "/" + parentId, verslag);
		}

		function _uploadeBijlage(id, type, parentId, files) {
			return helper.uploadFile(url + "bijlage?id=" + id + "&type=" + type + "&parentid=" + parentId, files);
		}

		function _getVoorKlant(klantLozeSleutel, paginaInfo) {
			paginaInfo.klantLozeSleutel = klantLozeSleutel;
			var options = { params: paginaInfo };
			return helper.get(url, options);
		}

		return {
			get: _get,
			getBySoort: _getBySoort,
			update: _update,
			delete: _delete,
			listByType: _listByType,
			insertForType: _insertForType,
			getVoorKlant: _getVoorKlant,
			uploadeBijlage: _uploadeBijlage
		};
  }]);
})();
;'use strict';
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
          verslagService.insertForType(ctrl.parentId, ctrl.type, { verslag: ctrl.nieuwVerslag }).then(function (response) {
            ctrl.verslagen.push(response.verslag);
            ctrl.resetVerslag();
            notificationService.notify("Verslag werd toegevoegd");
          });
        };

        ctrl.resetVerslag = function (id) {
          ctrl.verslagToevoegenZichtbaar = false;
          ctrl.nieuwVerslag.beschrijving = "";
          ctrl.nieuwVerslag.titel = "";
          ctrl.nieuwVerslag.verslagDatum = new Date();
        };

        ctrl.updateVerslag = function (verslag) {
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
;angular.module('awelzijn.verslag').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/verslag.html',
    "<div class=verslagen> <div ng-show=ctrl.verslagToevoegenZichtbaar> <div class=row> <div class=\"col-lg-6 col-md-6\"> <input type=text class=form-control ng-model=ctrl.nieuwVerslag.titel placeholder=\"Titel verslag\"> </div> <div class=\"col-lg-6 col-md-6\"> <div class=\"col-lg-6 col-md-6 labelTitle\" style=\"padding-left: 30px; padding-top: 10px\">Aangemaakt op:</div> <div class=\"col-lg-6 col-md-6\"> <data-tink-datepicker data-ng-model=ctrl.nieuwVerslag.datum> </data-tink-datepicker> </div> </div> <div class=col-lg-6> <div ng-show=\"(4000 - ctrl.nieuwVerslag.beschrijving.length) <= 25\" style=\"float: right; color: green\"> nog <span style=\"font-weight: bold\">{{4000 - ctrl.nieuwVerslag.beschrijving.length}}</span> karakters </div> </div> </div> <div class=row> <div class=col-lg-12 style=\"padding-top: 10px\"> <textarea a-welzijn-verslag-editor nieuw-verslag=true ng-model=ctrl.nieuwVerslag.beschrijving rows=4 ng-trim=false maxlength=4000 class=form-control placeholder=\"Geef hier uw tekst\"></textarea> </div> </div> <div class=row> <div class=col-lg-12 style=\"padding-top: 10px; margin-bottom:15px\"> <a ng-click=ctrl.verslagOpslaan() class=\"btn btn-primary btn-sm\"><span>Bewaren</span></a>\n" +
    "<a ng-click=ctrl.resetVerslag(); class=\"btn btn-default btn-sm\"><span>Annuleren</span></a> </div> </div> </div> <div ng-show=\"ctrl.verslagen.length === 0 && !ctrl.verslagToevoegenZichtbaar\" style=padding-bottom:20px> Er zijn geen verslagen. </div> <div class=verslag style=margin-left:10px ng-mouseover=\"verslag.hover = true\" ng-mouseleave=\"verslag.hover = false\" ng-repeat=\"verslag in ctrl.verslagen | orderBy:'verslagDatum':true\"> <hr ng-hide=\"$first\"> <div class=labelTitle> <span> {{verslag.titel}} op {{verslag.datum | date:\"dd MMMM yyyy\"}} </span>\n" +
    "<span style=\"color:gray; margin-left:5px; font-size: .9em\">door {{verslag.medewerker.voornaam + ' ' + verslag.medewerker.naam | capitalize}}</span>\n" +
    "<span ng-show=verslag.hover class=\"float-right verslag-edit-controls\"> <a><i class=\"fa fa-pencil\" ng-click=\"editing = !editing; ctrl.editVerslag(verslag);\"></i></a>\n" +
    "<a><i class=\"fa fa-trash-o\" ng-click=ctrl.deleteVerslag(verslag);></i></a> </span> </div> <p ng-bind-html=\"verslag.beschrijving | to_trusted\" ng-show=!editing></p> <div class=row> <div class=col-lg-11> <textarea a-welzijn-verslag-editor id=verslagTextbox editing=editing ng-show=false ng-class=\"{editing: editing, multiline: verslag.beschrijving.length > 400}\" ng-model=verslag.beschrijving maxlength=4000 ng-trim=false class=\"form-control SalgaTextArea col-lg-11\" placeholder=\"Geef hier uw tekst\" ng-required></textarea> </div> <div ng-show=\"(4000 - verslag.beschrijving.length) <= 25\" style=\"font-size:.8em; color: green\"> nog <span style=\"font-weight: bold\">{{4000 - verslag.beschrijving.length}}</span> karakters </div> <div class=verslag-editing-controls ng-show=editing> <a><i class=\"fa fa-save salgaEvalBtn-edit\" ng-click=\"ctrl.updateVerslag(verslag); editing = false;\"></i></a>\n" +
    "<a><i class=\"fa fa-ban salgaEvalBtn-edit\" ng-click=\"editing = false; ctrl.cancelVerslag(verslag);\"></i></a> </div> </div> </div> <a ng-show=!ctrl.verslagToevoegenZichtbaar class=\"btn btn-toevoegen btn-large\" ng-click=\"ctrl.verslagToevoegenZichtbaar = true;\"> <span>Verslag toevoegen</span> </a> </div>"
  );

}]);
