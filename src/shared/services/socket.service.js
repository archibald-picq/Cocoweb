(function() {
'use strict';

angular.module('Cocoweb')
.service('SocketService', ['$rootScope', '$websocket', 'Server', '$q',
                   function($rootScope,   $websocket,   Server,   $q) {
	
	var url = Server.apiUrl;
	url = url.replace(/^http(s?):/, 'ws$1:');
	console.info('connecting to ', url);
	
	var socket = $websocket(url, {reconnectIfNotNormalClose:true});
	
	function send(obj) {
		socket.send(typeof obj === 'string'? obj: JSON.stringify(obj));
	}
	
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
		$rootScope.$broadcast('message', obj);
		$rootScope.messages++;
		
		
		
		$rootScope.$apply();
	});
	
	socket.onOpen(function() {
		console.info('onOpen');
		$rootScope.connected = true;
		send({command: 'currentDevices'});
		// con.state = 'connected';
		$rootScope.$apply();
	});
	
	socket.onClose(function() {
		console.info('onClose');
		$rootScope.connected = false;
		// con.state = 'connecting';
		$rootScope.stats = '';
		$rootScope.$apply();
	});
	
	socket.onError(function() {
		console.info('onError');
		// con.state = 'failed';
		$rootScope.$apply();
	});
	
	
	return {
		send: send,
		device: function(address) {
			
		},
	};
}]);

})();