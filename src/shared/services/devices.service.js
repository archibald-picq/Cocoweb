(function() {
'use strict';

function	findByKey(array, search, keyName) {
	for (var i=0; i<array.length; i++)
		if (array[i] && array[i][keyName] === search)
			return array[i];
	return null;
}

angular.module('Cocoweb')
.service('DevicesService', ['$rootScope', 'SocketService', 'Server', '$q', '$timeout',
                   function($rootScope,    SocketService,   Server,   $q,   $timeout) {
	
	var boards = [];
	
	function	removeDevice(address) {
		for (var i = 0; i<boards.length; i++)
			if (boards[i].address === address) {
				boards.splice(i, 1);
				return;
			}
		console.warn('device ', address, ' not found for removing');
	}
	
	function	importClient(client) {
		// if (client.sensors) {
			// var motor;
			// if ((motor = findByKey(client.sensors, 'm1', 'code')) !== null)
				// motorLeft = motor;
			// if ((motor = findByKey(client.sensors, 'm2', 'code')) !== null)
				// motorRight = motor;
			// if (motorLeft && motorRight) {
				// console.warn('found motor left: ', motorLeft, ' and right: ', motorRight);
				// maxxBoard = client;
			// }
		// }
		for (var code in client.sensors)
			if (client.sensors.hasOwnProperty(code)) {
				// if (code.indexOf()
				client.sensors[code].code = code;
			}
		return client;
	}
	
	function	importClients(tab) {
		for (var i=0; i<tab.length; i++)
			boards.push(importClient(tab[i]));
	}
	
	function	findBoard(addr) {
		return findByKey(boards, addr, 'address');
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
					console.warn('board ', addr, ' (',typeof addr,') not found ', boards);
				
			}
	}
	
	var waiters = [];
	function triggerDeviceWaiters() {
		console.info('triggerDeviceWaiters');
		for (var i=0, device; i<waiters.length; i++) {
			device = findByKey(boards, waiters[i].address, 'address');
			if (device) {
				console.info('delayed resolve ', waiters[i].address, ' => ', device);
				waiters[i].deferred.resolve(device);
			}
			else {
				console.info('delayed reject ', waiters[i].address);
				waiters[i].deferred.reject();
			}
			$timeout.cancel(waiters[i].timeout);
		}
		waiters.splice(0, waiters.length);
	}
	
	$rootScope.$on('message', function(event, obj) {
		if (obj.response && obj.response.currentDevices) {
			importClients(obj.response.currentDevices);
			console.info('boards: ', boards);
			triggerDeviceWaiters();
		}
		else if (obj.newClient) {
			console.info('newClient(',obj.newClient,')');
			boards.push(importClient(obj.newClient));
		}
		else if (obj.clientLost) {
			removeDevice(obj.clientLost);
		}
		else if (obj.clientUpdate) {
			console.info('client.sensors: ', JSON.stringify(obj.clientUpdate.sensors));
			for (var i = 0; i<boards.length; i++)
				if (boards[i].address === obj.clientUpdate.address) {
					boards[i] = importClient(obj.clientUpdate);
					break ;
				}
		}
		else if (obj.sensorsUpdate) {
			// console.info('sensorsUpdate ', JSON.stringify(obj.sensorsUpdate));
			updateSensors(obj.sensorsUpdate);
		}
	});
	
	function getDevice(address) {
		var deferred = $q.defer();
		address = parseInt(address);
		
		var device = findByKey(boards, address, 'address');
		if (device) {
			console.info('instant resolve ', address, ' => ', device);
			deferred.resolve(device);
		}
		else {
			var tm = $timeout(function() {
				console.info('timeout reject ', address);
				deferred.reject();
			}, 5000);
			waiters.push({address: address, deferred: deferred, timeout: tm});
		}
		
		
		return deferred.promise;
	}
	
	function setDeviceName(device, name) {
		var deferred = $q.defer();
		
		deferred.resolve();
		
		return deferred.promise;
	}
	
	function setDeviceAddress(device, address) {
		var deferred = $q.defer();
		
		deferred.resolve();
		
		return deferred.promise;
	}
	
	return {
		devices: boards,
		device: getDevice,
		
		setName: setDeviceName,
		setAddress: setDeviceAddress,
	};
}]);

})();