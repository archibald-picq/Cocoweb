(function() {
'use strict';

angular.module('Cocoweb')
.directive('dynamicWidget', ['$compile', 'DevicesService', function($compile, DevicesService) {
	
	function createTemplate(item, board, sensor) {
		var html = '';
		// console.info('create template for ', sensor.type);
		if (DevicesService.isDigitalOut(sensor))
			html = '<widget-button class="widget" item="item" board="board" sensor="sensor"></widget-button>';
		else if (sensor.name && sensor.name.match(/thermo/i) || DevicesService.isThermometer(sensor)) {
			html = '<widget-thermometer class="widget" item="item" board="board" sensor="sensor"></widget-thermometer>';
		}
		else if (DevicesService.isLinky(sensor)) {
			html = '<widget-linky class="widget" item="item" board="board" sensor="sensor"></widget-linky>';
		}
		else {
			console.warn('unssuported: ', sensor);
			html = '<div class="widget unsupported">Unsupported</div>';
		}
		
		return html;
	}
	
	return {
		restrict : 'E',
		// replace: true,
		scope: {
			item: '=',
		},
		template: '<div class="widget initializing">' +
				'Initializing' +
			'</div>',
		link : function(scope, element, attrs) {
			
			function updateWidget() {
				var template = createTemplate(scope.item, scope.board, scope.sensor);
				// console.info('link dynamic for ', scope.item, ' => ', template);
				if (template)
					element.replaceWith($compile(template)(scope));
			}
			
			DevicesService.getBoardAndSensor(scope.item.widget.sensor)
				.then(function(boardSensor) {
					// console.info('getBoardAndSensor returns ', boardSensor);
					if (!boardSensor) {
						// scope.board = null;
						// scope.sensor = null;
						console.warn(scope.item.widget.sensor, ' not found');
						return ;
					}
					scope.board = boardSensor.board;
					scope.sensor = boardSensor.sensor;
					updateWidget();
				}, function() {
					console.info('no sensor for the first time, waiting event');
				});
			
			scope.$on('updateBoards', function(ev) {
				DevicesService.getBoardAndSensor(scope.item.widget.sensor)
					.then(function(boardSensor) {
						// console.info('getBoardAndSensor returns ', boardSensor);
						if (!boardSensor) {
							// scope.board = null;
							// scope.sensor = null;
							console.warn(scope.item.widget.sensor, ' not found');
							return ;
						}
						scope.board = boardSensor.board;
						scope.sensor = boardSensor.sensor;
						updateWidget();
					});
			});
			
		},
	};
}]);

})();