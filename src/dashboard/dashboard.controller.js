(function() {
'use strict';


angular.module('Cocoweb')
.controller('DashboardController', [
            '$scope', '$location', '$q', 'Server', 'SocketService', 'DevicesService', 'DashboardService',
	function($scope,   $location,   $q,   Server,   SocketService,   DevicesService,   DashboardService) {
	
	console.info('in dashboard');
	
	$scope.gridsterOpts = {
		columns: 4, // the width of the grid, in columns
		margins: [5, 5], // the pixel distance between each widget
		outerMargin: false, // whether margins apply to outer edges of the grid
		
		isMobile: false, // stacks the grid items if true
		// mobileBreakPoint: 400, // if the screen is not wider that this, remove the grid layout and stack the items
		mobileModeEnabled: false, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
		resizable: {
			enabled: true,
			handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
			start: function(event, $element, widget) {}, // optional callback fired when resize is started,
			resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
			stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
		},
		draggable: {
			enabled: true, // whether dragging items is supported
			// handle: '.my-class', // optional selector for drag handle
			start: function(event, $element, widget) {}, // optional callback fired when drag is started,
			drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
			stop: function(event, $element, widget) {
				console.info('dragged: ', event, $element, widget);
				DashboardService.saveItems($scope.standardItems);
			} // optional callback fired when item is finished dragging
		},
	};
	
	$scope.standardItems = DashboardService.getItems($scope.standardItems) || [
		{ sizeX: 2, sizeY: 1, row: 0, col: 0 },
		{ sizeX: 2, sizeY: 2, row: 0, col: 2 },
		{ sizeX: 1, sizeY: 1, row: 0, col: 4 },
		{ sizeX: 1, sizeY: 1, row: 0, col: 5 },
		{ sizeX: 2, sizeY: 1, row: 1, col: 0 },
		{ sizeX: 1, sizeY: 1, row: 1, col: 4 },
		{ sizeX: 1, sizeY: 2, row: 1, col: 5 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 0 },
		{ sizeX: 2, sizeY: 1, row: 2, col: 1 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 3 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 4 },
	];
}]);

})();
