'use strict';
(function(module) {
  try {
    module = angular.module('awelzijn.verslagservice');
  } catch (e) {
    module = angular.module('awelzijn.verslagservice', []);
  }
  module.directive('aWelzijnVerslagService', ["AppService", "awelzijnHelperHttp", "AppConfig", function (appService, helper, appConfig) {
    		var url = appConfig.apiRoot + "verslag/";

		function _get(id) {
			return helper.get(url + id);
		}

		function _getBySoort(soort, id) {
			return helper.get(url + soort + '/' + id);
		}

		function _update(id, verslag) {
			return helper.put(url + id, verslag);
		}

		function _delete(id, type) {
			return helper.delete(url + id +'/' + type);
		}

		function _listByType(parentId, type) {
			var options = { params: { parentId: parentId, type: type } };
			return helper.get(url, options);
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

		appService.logger.creation(serviceName);
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
