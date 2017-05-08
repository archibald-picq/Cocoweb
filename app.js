(function() {
'use strict';
var wait_for_files = null;
module.exports = {
	setLocker: function(locker) {
		wait_for_files = locker;
	}
};
/**
 * Simple server for developers
 * written by Archibald Picq (archibald.picq@bigint.fr)
 * 
 * Opens a HTTP webserver on port 8081 and distribute static files
 * from build/ folder. Also proxify requests from /v1/, /v2/, /v3/ virtual
 * folder to API server.
 * 
 * Require express, express-http-proxy and btoa for base64 authentication (other modules are built-ins).
 * Please run 'npm install' from root folder (the folder containing
 * 'package.json'). The server introduce a forced latency to the API
 * server to simulate heavy load and demontrate waiters in the interface.
 */
var api_latency = 0;
var http_port = 8081;
var express = require('express');
var config = require('./package');
var app = express();
var server = require('http').Server(app);
var proxy = require('express-http-proxy');
var urlParser = require('url');

var api_v1 = config.api || 'https://prod-server';
var api_v2 = config.api || 'https://preprod-server';
var api_v3 = config.api || 'http://localhost:8080';

app.use('/v1', proxy(api_v1, {
	forwardPath: function(req, res) {
		console.info('v1 forward', urlParser.parse(req.url).path);
		return /*'/v1' + */urlParser.parse(req.url).path;
	},
	decorateRequest: function(req) {
		console.info('> proxy '+req.method+' '+api_v1+req.path);
		return req;
	},
//	intercept: function(data, req, res, callback) {
//		console.info('  -> ', res.statusCode+' ', data.toString('utf8'));
//		callback(null, data);
//	},
}));

app.use('/v2', proxy(api_v2, {
	forwardPath: function(req, res) {
		console.info('v2 forward', urlParser.parse(req.url).path);
		return /*'/v2' + */urlParser.parse(req.url).path;
	},
	decorateRequest: function(req) {
		console.info('> proxy '+req.method+' '+api_v2+req.path);
		return req;
	},
//	intercept: function(data, req, res, callback) {
//		console.info('  -> ', res.statusCode+' ', data.toString('utf8'));
//		callback(null, data);
//	},
}));

app.use('/v3', proxy(api_v3, {
	forwardPath: function(req, res) {
		console.info('v3 forward', urlParser.parse(req.url).path);
		return /*'/v2' + */urlParser.parse(req.url).path;
	},
	decorateRequest: function(req) {
		console.info('> proxy '+req.method+' '+api_v3+req.path);
		return req;
	},
//	intercept: function(data, req, res, callback) {
//		console.info('  -> ', res.statusCode+' ', data.toString('utf8'));
//		callback(null, data);
//	},
}));

app.use(function(req, res, next) {
	wait_for_files? wait_for_files(next): next();
});

app.use(function(req, res, next) {
	// console.info('replace ', req.url, ' by ', req.url.replace(/\/(static|app)[a-z0-9]+\//, '/$1/'));
	req.url = req.url.replace(/\/(static|app)[a-z0-9]+\//, '/$1/');
	next();
});
app.use('/', express.static(__dirname+'/build/'));
app.all('/*', function(req, res, next) {
	if (req.originalUrl.indexOf('/static') === 0 || req.originalUrl.indexOf('/app') === 0)
		return next();
	// Just send the index.html for other files to support HTML5Mode
	res.sendFile('index.html', { root: __dirname+'/build' });
});

app.use(function(req, res, next) {
	res.status(404).send('not found');
});



server.listen(http_port, function() {
	console.log(config.name + ' v' + config.version + ' is listening on port '+http_port);
});
})();