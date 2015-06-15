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
