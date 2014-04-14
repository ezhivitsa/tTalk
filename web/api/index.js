var server = require("./server"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	host = '127.0.0.1',
	port = 8888,
<<<<<<< .mine
	handler = requestHandlers.handler;
	
handler.handle = {
	'/api/registration': 'registration',
	'/api/checkemail': 'checkEmail',
	'/api/checknickname': 'checkNickname',
	'/api/checklogin': 'checkLogin',
	'/api/login': 'login',
	'/api/logout': 'logout',
	'/api/createtalk': 'createTalk',
	'/api/talks': 'talks',
	'/api/talk': 'talk',
	'/api/myaccount': 'myAccount',
	'/api/user': 'user'
}
=======
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
		'/api/talk': requestHandlers.getTalk,
		'/api/myaccount': requestHandlers.myAccount,
		'/api/changeaccount': requestHandlers.changeAccount,
		'/api/user': requestHandlers.getUser
	};
>>>>>>> .theirs

server.startServer(host, port, router.route, handler);