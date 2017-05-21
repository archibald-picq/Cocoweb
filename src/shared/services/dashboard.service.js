(function() {
'use strict';

angular.module('Cocoweb')
.service('DashboardService', [function() {

	function getItems() {
		return JSON.parse(localStorage.getItem('dashboard') || 'null');
	}
	
	function saveItems(items) {
		localStorage.setItem('dashboard', angular.toJson(items));
	}


	return {
		getItems: getItems,
		saveItems: saveItems,
	};

}]);

})();