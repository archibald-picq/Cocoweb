(function() {
'use strict';

var DIGITAL_OUT = 0x01;		// for led, light, on/off purpose
var DIGITAL_OUT_TWO_WAY = 0x02;	// for motor with 1 speed in both directions
// var DIGITAL_OUT_THREE_WAY = 0x03;		// for led, light, on/off purpose
// var DIGITAL_IN = 0x04;
var ANALOG_IN = 0x05;
	

angular.module('Cocoweb')
.controller('HomeController', [
            '$scope', '$location', '$q', 'Server', 'SocketService', 'DevicesService',
	function($scope,   $location,   $q,   Server,   SocketService,   DevicesService) {
	
	var maxxBoard = null;
	var motorLeft = null;
	var motorRight = null;
	
	var AXIS_X = 0;
	var AXIS_Y = 1;
	var AXIS_Z = 5;
	var THROTTLE = 6;
	
	
	function	send(obj) {
		SocketService.send(obj);
	}
	
	
	
	$scope.boards = DevicesService.devices;
	
	$scope.connected = false;
	
	// var allValue = 0;
	$scope.command = function(board, sensor, value, fromEvent) {
		if (sensor.applyValue === value)
			return;
		console.info(new Date(), sensor.name, value, fromEvent);
		// sensor.applyValue = value;
		send({command:'setValue', params: {address: board.address, code: sensor.code, value: value}});
	};
	$scope.askName = function(board) {
		send({command:'askName', params: {address: board.address}});
	};
	$scope.askEvents = function(board) {
		send({command:'askEvents', params: {address: board.address}});
	};
	$scope.clearEvents = function(board) {
		send({command:'clearEvents', params: {address: board.address}});
	};
	$scope.getDefinition = function(board) {
		send({command:'getDefinition', params: {address: board.address}});
	};
	
	
	$scope.sensor_format = function(sensor, value) {
		// console.info(name, sensor, value);
		if (!sensor.code)
			return 'n/a';
		if (sensor.code.charAt(0) === 'a' || sensor.type === ANALOG_IN)
			return value+'mA';
		else if (typeof value === 'object')
			return JSON.stringify(value);
		// else if (sensor.code.charAt(0) == 'd')
			// return value? 'ON': 'OFF';
		else if (sensor.code.charAt(0) === 'i')
			return value;
		else
			return value;
	};

	$scope.isDigitalOut = function(sensor) {
		return sensor.type === DIGITAL_OUT;
	};
	$scope.isDigitalOutTwoWay = function(sensor) {
		return sensor.type === DIGITAL_OUT_TWO_WAY;
	};
	$scope.isOn = function(sensor) {
		return !!sensor.value;
	};
	$scope.isPositive = function(sensor) {
		return sensor.value > 0;
	};
	$scope.isNegative = function(sensor) {
		return sensor.value < 0;
	};
	$scope.boardName = function(board) {
		var hexAddr = 'i2c 0x'+board.address.toString(16);
		if (board.name) {
			return board.name+' ('+hexAddr+')'; 
		}
		return hexAddr;
	};
	
	function	sendCommand(axes) {
		
		if (motorLeft && motorRight) {
			if (AXIS_X < axes.length && AXIS_Y < axes.length && AXIS_Z < axes.length && THROTTLE && axes.length) {
				// var x = axes[AXIS_X];
				var y = axes[AXIS_Y];
				var z = axes[AXIS_Z];
				// var throttle = axes[THROTTLE];
				
				if (z < -0.5) {
					$scope.command(maxxBoard, motorLeft, 1, 'gamepad');
					$scope.command(maxxBoard, motorRight, -1, 'gamepad');
				}
				else if (z > 0.5) {
					$scope.command(maxxBoard, motorLeft, -1, 'gamepad');
					$scope.command(maxxBoard, motorRight, 1, 'gamepad');
				}
				else if (y < -0.5) {
					$scope.command(maxxBoard, motorLeft, -1, 'gamepad');
					$scope.command(maxxBoard, motorRight, -1, 'gamepad');
				}
				else if (y > 0.5) {
					$scope.command(maxxBoard, motorLeft, 1, 'gamepad');
					$scope.command(maxxBoard, motorRight, 1, 'gamepad');
				}
				else {
					$scope.command(maxxBoard, motorLeft, 0, 'gamepad');
					$scope.command(maxxBoard, motorRight, 0, 'gamepad');
				}
				// if (y < 0.6)
			}
		}
	}
	
	console.log('register for gamepad');
	window.addEventListener('gamepadconnected', function(e) {
		console.log('Contrôleur n°', e.gamepad.index, ' connecté : ', e.gamepad.id, '. ', e.gamepad.buttons.length, ' boutons, ', e.gamepad.axes.length, ' axes.');
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
		
		
	window.addEventListener('gamepadconnected', function(e) {
		console.log('Contrôleur n°%d connecté : %s. %d boutons, %d axes.',
		e.gamepad.index, e.gamepad.id,
		e.gamepad.buttons.length, e.gamepad.axes.length);
	});
	var haveEvents = 'GamepadEvent' in window;
	var controllers = {};
	var rAF = window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.requestAnimationFrame;
	var updateStatus;
		
	function	updateAxis(d, axes) {
		var containers = d.getElementsByClassName('axis');
		for (var i=0; i<containers.length; i++) {
			var a = containers[i];
			a.innerHTML = i + ': ' + axes[i].toFixed(4);
			a.setAttribute('value', axes[i] + 1);
		}
		
		sendCommand(axes);

	}

	
	function addgamepad(gamepad) {
		var e;
		console.info('addgamepad: ', gamepad);
		controllers[gamepad.index] = gamepad; var d = document.createElement('div');
		d.setAttribute('id', 'controller' + gamepad.index);
		var t = document.createElement('h1');
		t.appendChild(document.createTextNode('gamepad: ' + gamepad.id));
		d.appendChild(t);
		var b = document.createElement('div');
		b.className = 'buttons';
		for (var i=0; i<gamepad.buttons.length; i++) {
			e = document.createElement('span');
			e.className = 'button';
			//e.id = 'b' + i;
			e.innerHTML = i;
			b.appendChild(e);
		}
		d.appendChild(b);
		var a = document.createElement('div');
		a.className = 'axes';
		for (i=0; i<gamepad.axes.length; i++) {
			e = document.createElement('progress');
			e.className = 'axis';
			//e.id = 'a' + i;
			e.setAttribute('max', '2');
			e.setAttribute('value', '1');
			e.innerHTML = i;
			a.appendChild(e);
		}
		d.appendChild(a);
		// document.getElementById('start').style.display = 'none';
		document.body.appendChild(d);
		rAF(updateStatus);
	}
	
	function removegamepad(gamepad) {
		var d = document.getElementById('controller' + gamepad.index);
		document.body.removeChild(d);
		delete controllers[gamepad.index];
	}
	
	function connecthandler(e) {
		addgamepad(e.gamepad);
	}

	function disconnecthandler(e) {
		removegamepad(e.gamepad);
	}
	
	function scangamepads() {
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		for (var i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				if (!(gamepads[i].index in controllers)) {
					addgamepad(gamepads[i]);
				} else {
					controllers[gamepads[i].index] = gamepads[i];
				}
			}
		}
	}
	
	updateStatus = function() {
		scangamepads();
		for (var j in controllers) {
			if (controllers.hasOwnProperty(j)) {
				var controller = controllers[j];
				var d = document.getElementById('controller' + j);
				var buttons = d.getElementsByClassName('button');
				for (var i=0; i<controller.buttons.length; i++) {
					var b = buttons[i];
					var val = controller.buttons[i];
					var pressed = val === 1.0;
					if (typeof(val) === 'object') {
						pressed = val.pressed;
						val = val.value;
					}
					var pct = Math.round(val * 100) + '%';
					b.style.backgroundSize = pct + ' ' + pct;
					if (pressed) {
						b.className = 'button pressed';
					} else {
						b.className = 'button';
					}
				}

				updateAxis(d, controller.axes);
			}
		}
		rAF(updateStatus);
	};


	if (haveEvents) {
	console.info('bind event');
		window.addEventListener('gamepadconnected', connecthandler);
		window.addEventListener('gamepaddisconnected', disconnecthandler);
		scangamepads();
	} else {
		console.info('poll');
		setInterval(scangamepads, 500);
	}

	
	
	
	
	
}]);


})();
