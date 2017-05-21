(function() {
'use strict';

angular.module('Cocoweb')
.directive('widgetButton', ['DevicesService', function(DevicesService) {
	return {
		restrict : 'E',
		// replace: true,
		scope: {
			item: '=',
			board: '=',
			sensor: '=',
		},
		template: '' +
			'<div class="name" data-ng-bind="sensor.name"></div>' +
			'<span class="digital-out" data-ng-if="isDigitalOut(sensor)">' +
				'<button data-ng-disabled="isOn(sensor)" data-ng-click="command(board, sensor, true)">ON</button>' +
				'<button data-ng-disabled="!isOn(sensor)" data-ng-click="command(board, sensor, false)">OFF</button>' +
			'</span>',
		link : function(scope, element, attrs) {
			// console.info('link directive with scope: ', scope, ' at element ', element);
			
			
			scope.isDigitalOut = DevicesService.isDigitalOut;
			scope.isOn = DevicesService.isOn;
			scope.command = DevicesService.command;
		},
	};
}]);

})();
