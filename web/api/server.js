var server = require("./serverUtil"),
	router = require('./router'),
	requestHandlers = require('./requestHandlers'),
	host = '127.0.0.1',
	port = 8888,
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
	'/api/user': 'user',
	'/api/subscribe': 'subscribe',
	'/api/comment': 'comment',
	'/api/comments': 'comments',
	'/api/evaluatecomment': 'evaluateComment',
	'/api/evaluatetalk': 'evaluateTalk',
	'/api/deletecomment': 'deleteComment',
	'/api/deletetalk': 'deleteTalk'
}

server.startServer(host, port, router.route, handler);