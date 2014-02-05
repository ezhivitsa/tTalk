var http = require('http'),
	url = require("url");

function startServer (host, port, route, handle) {
	
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname;
		if ( request.method.toLowerCase() === 'get' ) {
			processGetRequest(pathname, url, route, handle, request, response);
		}
		else if ( request.method.toLowerCase() === 'post' ) {
			processPostRequest(pathname, route, handle, request, response);
		}

		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Hello World");
		response.end();

	}).listen(port, host);

	console.log('Server was started');
}

function processGetRequest (pathname, url, route, handle, request, response) {
	var url_parts = url.parse(request.url, true),
		query = url_parts.query;

	console.log(query);
	route(handle, pathname, query, response);
}

function processPostRequest (pathname, route, handle, request, response) {
	request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    request.addListener("end", function() {
      route(handle, pathname, postData, response);
    });
}

exports.startServer = startServer;