(function() {

angular.module('Cocoweb')
.controller('DashboardAddItemController', ['$scope', '$window', 'DevicesService',
                       function($scope,   $window,   DevicesService) {
	
	$scope.boards = DevicesService.devices;
	
	$scope.selectItem = function(board, sensor) {
		console.info(board, sensor);
		$scope.addItem(board, sensor);
		$window.history.back();
	};
	
	$scope.cancelEdition = function() {
		$window.history.back();
	};
}]);

})();