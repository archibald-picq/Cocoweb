(function() {
'use strict';

angular.module('Cocoweb').config([
            '$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider,   $urlRouterProvider,   $locationProvider) {

		$stateProvider.state('root.layout.home', {
			url: '/',
			// data: { class: 'home' },
			templateUrl: 'home/index.html',
			controller: 'HomeController',
			resolve: {
				module: ['$ocLazyLoad', 'Server', function($ocLazyLoad, Server) {
					return $ocLazyLoad.load([Server.baseUrl + '/module/home.js']);
				}],
			}
		});
	}
]);

})();
