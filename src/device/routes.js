(function() {
'use strict';

angular.module('Cocoweb').config([
            '$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider,   $urlRouterProvider,   $locationProvider) {

		$stateProvider
			// .state('root.layout.device', {
				// abstract: true,
			// })
			.state('root.layout.home.edit', {
				url: '/:address',
				// data: { class: 'home' },
				templateUrl: 'device/edit.html',
				controller: 'EditController',
				resolve: {
					module: ['$ocLazyLoad', 'Server', function($ocLazyLoad, Server) {
						return $ocLazyLoad.load([Server.baseUrl + '/module/device.js']);
					}],
					device: ['DevicesService', '$stateParams', function(DevicesService, $stateParams) {
						console.info('wait for device ', $stateParams);
						return DevicesService.device($stateParams.address)
							.then(function(device) {
								console.info('found device ', device);
								return device;
							});
					}],
				}
			});
	}
]);

})();
