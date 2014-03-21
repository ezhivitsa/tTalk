var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	host = '127.0.0.1',
	port = 8888,
	handle = {
		'/api/registration': requestHandlers.registration,
		'/api/login': requestHandlers.login,
		'/api/checkemail': requestHandlers.checkEmail,
		'/api/checknickname': requestHandlers.checkNickname,
		'/api/checklogin': requestHandlers.checkLogin,
		'/api/login': requestHandlers.login,
		'/api/logout': requestHandlers.logout,
		'/api/createtalk': requestHandlers.createTalk,
		'/api/talks': requestHandlers.getTalks,
		'/api/talk': requestHandlers.getTalk
	};

server.startServer(host, port, router.route, handle);