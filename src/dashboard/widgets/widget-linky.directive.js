(function() {
'use strict';

angular.module('Cocoweb')
.directive('widgetLinky', ['DevicesService', function(DevicesService) {
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
				'<div>Intensité Inst. <span class="value">{{sensor.value.iinst}} A</span></div>' +
				'<div>Puissance App. <span class="value">{{sensor.value.papp}} V/A</span></div>' +
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
