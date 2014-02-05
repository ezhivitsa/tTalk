var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	mongodb = require('./mongodb'),
	handle = {},
	host = '127.0.0.1',
	port = 8888;

handle['/api/registration'] = requestHandlers.registration;

server.startServer(host, port, router.route, handle);
mongodb.createConnection();