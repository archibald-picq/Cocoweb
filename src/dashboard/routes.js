(function() {
'use strict';

angular.module('Cocoweb').config([
            '$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider,   $urlRouterProvider,   $locationProvider) {

		$stateProvider
			.state('root.layout.dashboard', {
				url: '/dashboard',
				// data: { class: 'home' },
				templateUrl: 'dashboard/index.html',
				controller: 'DashboardController',
				resolve: {
					module: ['$ocLazyLoad', 'Server', function($ocLazyLoad, Server) {
						return $ocLazyLoad.load([Server.baseUrl + '/module/dashboard.js']);
					}],
				}
			})
			.state('root.layout.dashboard.add', {
				url: '/add',
				// data: { class: 'home' },
				templateUrl: 'dashboard/add-item.html',
				controller: 'DashboardAddItemController',
			});
	}
]);

})();
