var mongodb = require('./mongodb'),
	sessionActions = require('./sessionActions');

function checkLogin (data, response, session) {
	if ( session && session.email && session.token ) {
		mongodb.checkToken(session, response, function (token) {
			sessionActions.setSessionData(session, token, session);
		});
	}
	else {
		response.writeHead(400, {'Content-Type': 'application/json'});
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
		response.writeHead(501, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({field: 'data', message: errors.data}));
	}
	
}

function login (data, response, session) {
	if ( data.email && data.password ) {
		mongodb.userLogin(data, response);
	}
	else {
		response.writeHead(501, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({email: errors.data}));
	}	
}

function checkEmail (data, response, session) {
	mongodb.checkEmail(data, response);
}

function checkNickname (data, response, session) {
	mongodb.checkNickname(data, response);
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;