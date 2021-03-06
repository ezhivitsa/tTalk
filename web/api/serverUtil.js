var http = require('http'),
	url = require('url'),    
	SessionHandler = require('./session/SessionHandler.js').SessionHandler,
	sessionHandler = new SessionHandler(),
	mongodb = require('./mongodb/mongodb.js');

function startServer (host, port, route, handle) {
	
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname,
			session = sessionHandler.getSession(request, response);

		if ( pathname == '/api/createtalk' ) {
			route('post', handle, pathname, {}, response, session, request);
		}
		else {
			if ( request.method.toLowerCase() === 'get' ) {
				processGetRequest(pathname, url, route, handle, request, response, session);
			}
			else if ( request.method.toLowerCase() === 'post' ) {
				processPostRequest(pathname, route, handle, request, response, session);
			}
		}


	}).listen(port, host);

	mongodb.openConnection();
}

function processGetRequest (pathname, url, route, handle, request, response, session) {
	var url_parts = url.parse(request.url, true),
		query = url_parts.query;

	route('get', handle, pathname, query, response, session);
}

function processPostRequest (pathname, route, handle, request, response, session) {
	var postData = '';
	request.addListener("data", function(postDataChunk) {
    	postData += postDataChunk;
    });

    request.addListener("end", function() {
    	postData = postData || '{}';
     	route('post', handle, pathname, JSON.parse(postData), response, session);
    });
}

exports.startServer = startServer;

process.on('exit', function() { terminator(); });

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element, index, array) {
	process.on(element, function() { terminator(element); });
});

function terminator(sig){
	if (typeof sig === "string") {
		console.log('%s: Received %s - terminating sample app ...',	Date(Date.now()), sig);
		process.exit(1);
	}
	console.log('%s: Node server stopped.', Date(Date.now()) );
};