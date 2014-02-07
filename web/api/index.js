var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	mongodb = require('./mongodb'),
	session = require('./session'),
	handle = {},
	host = '127.0.0.1',
	port = 8888;

handle['/api/registration'] = requestHandlers.registration;
handle['/api/login'] = requestHandlers.login;
handle['/api/checkemail'] = requestHandlers.checkEmail;
handle['/api/checknickname'] = requestHandlers.checkNickname;

server.startServer(host, port, router.route, handle, mongodb);