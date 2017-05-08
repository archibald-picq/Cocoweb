(function() {
'use strict';

var DIGITAL_OUT = 0x01;		// for led, light, on/off purpose
var DIGITAL_OUT_TWO_WAY = 0x02;	// for motor with 1 speed in both directions
// var DIGITAL_OUT_THREE_WAY = 0x03;		// for led, light, on/off purpose
// var DIGITAL_IN = 0x04;
var ANALOG_IN = 0x05;
	
function	findByKey(array, search, keyName) {
	for (var i=0; i<array.length; i++)
		if (array[i] && array[i][keyName] === search)
			return array[i];
	return null;
}

angular.module('Cocoweb')
.controller('HomeController', [
            '$scope', '$websocket', '$location', '$q', 'Server',
	function($scope,   $websocket,   $location,   $q,   Server) {
	
	var maxxBoard = null;
	var motorLeft = null;
	var motorRight = null;
	var socket = null;
	
	var AXIS_X = 0;
	var AXIS_Y = 1;
	var AXIS_Z = 5;
	var THROTTLE = 6;
	
	function	removeDevice(address) {
		for (var i = 0; i<$scope.boards.length; i++)
			if ($scope.boards[i].address === address) {
				$scope.boards.splice(i, 1);
				return;
			}
		console.warn('device ', address, ' not found for removing');
	}
	
	function	updateStats(stats) {
		$scope.stats = (Math.round(stats.ping*100)/100)+' ms';
		$scope.stats += ', '+(Math.round(stats.frequency*10)/10)+' req/s';
		$scope.stats += ', '+Math.round(stats.succeed / (stats.succeed + stats.failed) * 100)+' %';
	}
	
	function	importClient(client) {
		if (client.sensors) {
			var motor;
			if ((motor = findByKey(client.sensors, 'm1', 'code')) !== null)
				motorLeft = motor;
			if ((motor = findByKey(client.sensors, 'm2', 'code')) !== null)
				motorRight = motor;
			if (motorLeft && motorRight) {
				console.warn('found motor left: ', motorLeft, ' and right: ', motorRight);
				maxxBoard = client;
			}
		}
		for (var code in client.sensors)
			if (client.sensors.hasOwnProperty(code)) {
				// if (code.indexOf()
				client.sensors[code].code = code;
			}
		return client;
	}
	
	function	importClients(tab) {
		for (var i=0; i<tab.length; i++)
			tab[i] = importClient(tab[i]);
		return tab;
	}
	
	function	findBoard(addr) {
		return findByKey($scope.boards, addr, 'address');
	}
	
	function	updateSensors(clients) {
		// console.info('client.sensors: ', JSON.stringify(clients));
		for (var addr in clients)
			if (clients.hasOwnProperty(addr)) {
				addr = parseInt(addr, 10);
				var board = findBoard(addr);
				if (board) {
					var newValues = clients[addr];
					var sensor;
					for (var code in newValues)
						if (newValues.hasOwnProperty(code)) {
							if ((sensor = board.sensors[code]) !== null)
								sensor.value = newValues[code];
							else
								console.warn('sensor ', code, ' not found in ', board.sensors);
						}
					
				}
				else
					console.warn('board ', addr, ' (',typeof addr,') not found ', $scope.boards);
				
			}
	}
	
	function	send(obj) {
		socket.send(JSON.stringify(obj));
	}
	
	
	
	$scope.stats = '';
	var url = Server.apiUrl;
	url = url.replace(/^http(s?):/, 'ws$1:');
	console.info('connecting to ', url);
	
	socket = $websocket(url, {reconnectIfNotNormalClose:true});
	socket.onMessage(function(message) {
		// con.messageCount++;
		
		// con.averages.push({time: new Date(), bytes: message.data.length});
		// con.speed = calcBandwidth(con.averages);
		// console.info('onMessage(',message.data,')');
		var obj;
		try {
			obj = JSON.parse(message.data);
		}
		catch(e) {
			console.warn('Unparsable payload "'+message+'\': ', e.message);
			return;
		}
		if (obj.response && obj.response.currentDevices) {
			$scope.boards = importClients(obj.response.currentDevices);
			console.info('boards: ', $scope.boards);
		}
		else if (obj.newClient) {
			console.info('newClient(',obj.newClient,')');
			$scope.boards.push(importClient(obj.newClient));
		}
		else if (obj.clientLost) {
			removeDevice(obj.clientLost);
		}
		else if (obj.stats) {
			updateStats(obj.stats);
		}
		else if (obj.clientUpdate) {
			console.info('client.sensors: ', JSON.stringify(obj.clientUpdate.sensors));
			for (var i = 0; i<$scope.boards.length; i++)
				if ($scope.boards[i].address === obj.clientUpdate.address) {
					$scope.boards[i] = importClient(obj.clientUpdate);
					break ;
				}
		}
		else if (obj.sensorsUpdate) {
			// console.info('sensorsUpdate ', JSON.stringify(obj.sensorsUpdate));
			updateSensors(obj.sensorsUpdate);
		}
		else
			console.info('message: ', obj);
		
		$scope.$apply();
	});
	
	socket.onOpen(function() {
		console.info('onOpen');
		$scope.connected = true;
		send({command: 'currentDevices'});
		// con.state = 'connected';
		$scope.$apply();
	});
	socket.onClose(function() {
		console.info('onClose');
		$scope.connected = false;
		// con.state = 'connecting';
		$scope.stats = '';
		$scope.$apply();
	});
	socket.onError(function() {
		console.info('onError');
		// con.state = 'failed';
		$scope.$apply();
	});
	
	$scope.boards = [];
	
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
