var http = require('http'),
	url = require('url'),
	SessionHandler = require('./session/SessionHandler.js').SessionHandler,
	sessionHandler = new SessionHandler(),
	mongodb = require('./mongodb/mongodb.js');

function startServer (host, port, route, handle) {
	
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname,
			session = sessionHandler.getSession(request, response);

		if ( request.method.toLowerCase() === 'get' ) {
			processGetRequest(pathname, url, route, handle, request, response, session);
		}
		else if ( request.method.toLowerCase() === 'post' ) {
			processPostRequest(pathname, route, handle, request, response, session);
		}

	}).listen(port, host);

	mongodb.openConnection();
}

function processGetRequest (pathname, url, route, handle, request, response, session) {
	var url_parts = url.parse(request.url, true),
		query = url_parts.query;

	route(handle, pathname, query, response, session);
}

function processPostRequest (pathname, route, handle, request, response, session) {
	var postData = '';
	request.addListener("data", function(postDataChunk) {
    	postData += postDataChunk;
    });

    request.addListener("end", function() {
    	postData = postData || '{}';
     	route(handle, pathname, JSON.parse(postData), response, session);
    });
}

exports.startServer = startServer;