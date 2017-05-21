(function() {

angular.module('Cocoweb')
.controller('EditController', ['$scope', 'device', '$window', 'DevicesService',
                       function($scope,   device,   $window,   DevicesService) {
	console.info('device: ', device);
	
	$scope.saving = false;
	$scope.error = '';
	$scope.address = device.address;
	$scope.name = device.name;
	
	$scope.saveAndExit = function() {
		console.info('save and exit');
		$scope.saving = true;
		$scope.error = '';
		DevicesService
			.setName(device, $scope.name)
			.then(function() {
				return DevicesService
					.setAddress(device, $scope.address);
			})
			.then(function() {
				$window.history.back();
			}, function(err) {
				$scope.saving = false;
				$scope.error = err;
			});
	};
	
	$scope.cancelEdition = function() {
		$window.history.back();
	};
}]);

})();