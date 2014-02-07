var http = require('http'),
	url = require("url");

function startServer (host, port, route, handle, mongodb) {
	
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname;
		if ( request.method.toLowerCase() === 'get' ) {
			processGetRequest(pathname, url, route, handle, request, response, mongodb);
		}
		else if ( request.method.toLowerCase() === 'post' ) {
			processPostRequest(pathname, route, handle, request, response, mongodb);
		}

	}).listen(port, host);
}

function processGetRequest (pathname, url, route, handle, request, response, mongodb) {
	var url_parts = url.parse(request.url, true),
		query = url_parts.query;

	route(handle, pathname, query, response, mongodb);
}

function processPostRequest (pathname, route, handle, request, response, mongodb) {
	var postData = '';
	request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener("end", function() {
      route(handle, pathname, JSON.parse(postData), request, response, mongodb);
    });
}

exports.startServer = startServer;