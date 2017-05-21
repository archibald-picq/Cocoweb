(function() {
'use strict';

angular.module('Cocoweb', [
	'angular-websocket',
	'ui.router',
	'oc.lazyLoad',
	'ngAnimate',
	'gridster',
])

.config(['$httpProvider', '$qProvider', function($httpProvider, $qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
	$httpProvider.defaults.withCredentials = true;
	$httpProvider.defaults.headers.common.Accept = 'application/json';
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

}])
.config(['$compileProvider', function($compileProvider) {
	// $compileProvider.debugInfoEnabled(false);
}])
.constant('Server', (function() {
	var baseUrl = null;
	var scripts = document.getElementsByTagName('script'), l = scripts.length;
	for (var i=0, matches; i<l; i++) {
		// if (scripts[i].src)
			// console.info('search: ', scripts[i].src.match(/^(.*\/)lib.js$/));
		if (scripts[i].src && (matches = scripts[i].src.match(/^(.*\/)(lib|app).js$/))) {
			baseUrl = matches[1];
			break ;
		}
	}
	var root = document.location.protocol+'//'+document.location.hostname+':'+document.location.port;
	if (baseUrl.indexOf(root) === 0)
		baseUrl = baseUrl.substr(root.length);
	
	return {
		baseUrl: baseUrl,
		
	};
})())
.config(['Server', function(Server) {
	var root = document.location.protocol+'//'+document.location.hostname+':'+document.location.port;
	Server.apiUrl = typeof window.config === 'object' && window.config.api? window.config.api: root;
}])
/**
 * create a stub function to register templates
 * http://stackoverflow.com/questions/25168593/angularjs-lazy-loading-controllers-and-content
 */
.run(['$templateCache', function($templateCache) {
	angular.module('Cocoweb').asyncTemplate = function(map) {
		for (var i in map)
			if (map.hasOwnProperty(i))
				$templateCache.put(i, map[i]);
	};
}]);


})();