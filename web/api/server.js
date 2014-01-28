var http = require('http'),
	url = require("url");

function startServer (route, handle) {
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname;
		if ( request.method.toLowerCase() === 'get' ) {
			console.log('get request');
			processGetRequest(pathname, url, route, handle, request, response);
		}
		else if ( request.method.toLowerCase() === 'post' ) {
			console.log('post request');
			processPostRequest(pathname, route, handle, request, response);
		}

		
    	console.log("Request for " + pathname + " received.");
    	route(handle, pathname);
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Hello World");
		response.end();

	}).listen('8888');

	console.log('Server was started');
}

function processGetRequest (pathname, url, route, handle, request, response) {
	var url_parts = url.parse(request.url, true),
		query = url_parts.query;
		
	console.log(query);
	route(handle, pathname, response);
}

function processPostRequest (pathname, route, handle, request, response) {
	request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });
}

exports.startServer = startServer;