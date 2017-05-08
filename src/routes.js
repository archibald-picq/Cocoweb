(function() {
'use strict';

angular.module('Cocoweb').config([
            '$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider',
	function($stateProvider,   $urlRouterProvider,   $locationProvider,   $urlMatcherFactoryProvider) {
		
		// $urlRouterProvider.otherwise('/');
		$urlMatcherFactoryProvider.strictMode(false);
		$locationProvider.html5Mode(true);

		$stateProvider
			.state('root', {
				abstract: true,

				templateUrl: 'layout.html',
				controller: 'RootController'
			})
			.state('root.layout', {
				abstract: true,
				views: {
					// 'header': {
						// controller: 'HeaderController',
						// templateUrl: 'shared/templates/header.html'
					// },
					'': {
						template: '<div data-ui-view></div>'
					},
					// 'footer': {
						// templateUrl: 'shared/templates/footer.html'
					// }
				}
			});

		// $urlRouterProvider.otherwise(function($injector, $location) {
			// var state = $injector.get('$state');
			// state.go('root.layout.404');
			// return $location.path();
		// });
}])

.run(['$rootScope', '$state', '$document', function($rootScope, $state, $document) {
	$rootScope.$on('$stateNotFound', function(event) {
		console.warn('stateNotFound', event);
	});

	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
		console.error('stateChangeError', event, toState, toParams, fromState, fromParams, error);
	});

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
		// $document.ready(function() {
		// 	angular.element($document[0].body).addClass(toState.data.class);
		// });

	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
		// if ($state.current.data.back) {
			// $rootScope.back = $state.current.data.back || null;
		// }

		// $rootScope.title = toState.data.title;
		// $rootScope.root_class = toState.data.class || '';

		// $document.ready(function() {
		//
		//
		// 	angular.element($document[0].body).addClass(toState.data.class);
		//
		// 	if (fromState.data)
		// 		angular.element($document[0].body).removeClass(fromState.data.class);
		// });

	});
}]);

})();
