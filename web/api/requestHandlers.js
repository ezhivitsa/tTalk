var mongodb = require('./mongodb'),
	sessionActions = require('./sessionActions'),
	errors  = {
		data: 'Not all data',
		cookie: 'Errors with cookie'
	};

function checkLogin (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end();
	});
}

function checkIsUserLogined (data, response, session, callback) {
	if ( session && session.email && session.token ) {
		mongodb.checkToken(session, response, function (token) {
			sessionActions.setSessionData(session, token, session);
			( callback ) && callback();
		});
	}
	else {
		response.writeHead(401, {'Content-Type': 'application/json'});
		response.end();
	}
}

function registration (data, response, session) {
	if ( data.email && data.password && data.nickname ) {
		mongodb.insertUser(data, response, function (token) {
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		response.writeHead(403, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({field: 'data', message: errors.data}));
	}
	
}

function login (data, response, session) {
	if ( data.email && data.password ) {
		mongodb.userLogin(data, response, function (token) {
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		response.writeHead(403, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({field: 'data', message: errors.cookie}));
	}	
}

function logout (data, response, session) {
	if( session ) {
		sessionActions.setSessionData({}, '', session);
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end();
	}
	else {
		response.writeHead(401, {'Content-Type': 'application/json'});
		response.end();
	}
}

function checkEmail (data, response, session) {
	mongodb.checkEmail(data, response);
}

function checkNickname (data, response, session) {
	mongodb.checkNickname(data, response);
}

function createTalk (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		//console.log('user logined');
	});
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;
exports.checkLogin = checkLogin;
exports.logout = logout;