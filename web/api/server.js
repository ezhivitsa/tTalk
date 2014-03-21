var http = require('http'),
	url = require('url'),
	formidable = require('formidable'),
    util = require('util'),
    fs   = require('fs-extra');
	SessionHandler = require('./session/SessionHandler.js').SessionHandler,
	sessionHandler = new SessionHandler(),
	mongodb = require('./mongodb/mongodb.js');

function startServer (host, port, route, handle) {
	
	http.createServer(function (request, response) {

		var pathname = url.parse(request.url).pathname,
			session = sessionHandler.getSession(request, response);

		if ( pathname == '/api/upload' ) {
			uploadFile(request, response);
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

function uploadFile(req, res) {
	var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.end();
    });
 
    // form.on('progress', function(bytesReceived, bytesExpected) {
    //     var percent_complete = (bytesReceived / bytesExpected) * 100;
    //     console.log(percent_complete.toFixed(2));
    // });
 
    form.on('error', function(err) {
        console.error(err);
    });
 
    form.on('end', function(fields, files) {
    	console.log(fields);
        /* Temporary location of our uploaded file */
        var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
        /* Location where we want to copy the uploaded file */
        var new_location = '../content/uploads/img/';
 
        fs.copy(temp_path, new_location + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
            }
        });
    });	
}

exports.startServer = startServer;