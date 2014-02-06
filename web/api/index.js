var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	mongodb = require('./mongodb'),
	handle = {},
	host = '127.0.0.1',
	port = 8888;

handle['/api/registration'] = requestHandlers.registration;
handle['/api/login'] = requestHandlers.login;

server.startServer(host, port, router.route, handle, mongodb);