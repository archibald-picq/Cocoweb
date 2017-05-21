(function() {
'use strict';

angular.module('Cocoweb').controller('RootController', [
             '$scope', '$window', '$state',
	 function($scope,   $window,   $state) {
	 
		$scope.menuExpanded = false;
		
		$scope.menuExpand = function() {
			console.info('expand menu');
			$scope.menuExpanded = true;
		};
		
		$scope.menuCollapse = function() {
			console.info('pollapse menu');
			$scope.menuExpanded = false;
		};
	}
]);
})();
