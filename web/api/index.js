var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	handle = {},
	host = '127.0.0.1',
	port = 8888;

handle['/api/registration'] = requestHandlers.registration;
handle['/api/login'] = requestHandlers.login;
handle['/api/checkemail'] = requestHandlers.checkEmail;
handle['/api/checknickname'] = requestHandlers.checkNickname;
handle['/api/checklogin'] = requestHandlers.checkLogin;

server.startServer(host, port, router.route, handle);