(function() {
'use strict';


angular.module('Cocoweb')
.controller('DashboardController', [
            '$scope', '$location', '$q', 'Server', 'SocketService', 'DevicesService', 'DashboardService',
	function($scope,   $location,   $q,   Server,   SocketService,   DevicesService,   DashboardService) {
	
	function applyEditMode() {
		if ($scope.editMode) {
			$scope.gridsterOpts.draggable.enabled = true;
			$scope.gridsterOpts.resizable.enabled = true;
		}
		else {
			$scope.gridsterOpts.draggable.enabled = false;
			$scope.gridsterOpts.resizable.enabled = false;
		}
	}
	
	$scope.editMode = false;
	
	$scope.toggleEditMode = function() {
		$scope.editMode = !$scope.editMode;
		applyEditMode();
	};
	
	$scope.addItem = function(board, sensor) {
		console.info('addItem in dashboard: ', board, sensor);
		if ($scope.filterSensor(board, sensor)) {
			console.info('already in dashoboard ', board, sensor);
			return ;
		}
		$scope.standardItems.push({
			sizeX: 2,
			sizeY: 1,
			row: 0,
			col: 0,
			widget: {
				sensor: board.address+':'+sensor.code,
			}
		});
		DashboardService.saveItems($scope.standardItems);
	};
	
	$scope.filterSensor = function(board, sensor) {
		console.info('filterSensor: ', board, sensor);
		for (var i = 0; i < $scope.standardItems.length; i++) {
			var item = $scope.standardItems[i];
			
			if (item.widget && item.widget.sensor === board.address+':'+sensor.code)
				return true;
		}
		return false;
	};
	
	$scope.removeItem = function(item) {
		var idx = $scope.standardItems.indexOf(item);
		
		if (idx === -1) {
			console.warn('item not found: ', item);
			return ;
		}
		$scope.standardItems.splice(idx, 1);
		DashboardService.saveItems($scope.standardItems);
	};
	
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
			stop: function(event, $element, widget) {
				console.info('resized: ', event, $element, widget);
				DashboardService.saveItems($scope.standardItems);
			} // optional callback fired when item is finished resizing
		},
		draggable: {
			enabled: true, // whether dragging items is supported
			handle: '.drag-handler', // optional selector for drag handle
			start: function(event, $element, widget) {}, // optional callback fired when drag is started,
			drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
			stop: function(event, $element, widget) {
				console.info('dragged: ', event, $element, widget);
				DashboardService.saveItems($scope.standardItems);
			} // optional callback fired when item is finished dragging
		},
	};
	
	applyEditMode();
	
	
	$scope.standardItems = DashboardService.getItems($scope.standardItems) || [];
	
	// console.info('item: ', $scope.standardItems);
}]);

})();
