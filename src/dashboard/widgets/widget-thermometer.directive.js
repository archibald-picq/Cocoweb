(function() {
'use strict';

angular.module('Cocoweb')
.directive('widgetThermometer', ['DevicesService', function(DevicesService) {
	return {
		restrict : 'E',
		// replace: true,
		scope: {
			item: '=',
			board: '=',
			sensor: '=',
		},
		template: '' +
			'<div data-ng-if="!sensor.value">waiting for data</div>' +
			'<div data-ng-if="sensor.value">' +
				'<div>{{sensor.value[0] | number:1}}° C</div>' +
			'</div>',
		link : function(scope, element, attrs) {
			// console.info('link directive with scope: ', scope, ' at element ', element);
			
			
			scope.isDigitalOut = DevicesService.isDigitalOut;
			scope.isOn = DevicesService.isOn;
			scope.command = DevicesService.command;
		},
	};
}]);

})();
