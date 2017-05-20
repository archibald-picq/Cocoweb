(function() {

angular.module('Cocoweb')
.controller('HeaderController', ['$scope', function($scope) {
	$scope.stats = '';
	
	function	updateStats(stats) {
		$scope.stats = (Math.round(stats.ping*100)/100)+' ms';
		$scope.stats += ', '+(Math.round(stats.frequency*10)/10)+' req/s';
		$scope.stats += ', '+Math.round(stats.succeed / (stats.succeed + stats.failed) * 100)+' %';
	}
	
	$scope.$on('message', function(event, obj) {
		if (obj.stats) {
			updateStats(obj.stats);
		}
	});
}]);

})();