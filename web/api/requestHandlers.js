var mongoActions = require('./mongoActions'),
	sessionActions = require('./sessionActions'),
	responseActions = require('./responseActions');

function checkLogin (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		responseActions.sendResponse(response, 200);
	});
}

function checkIsUserLogined (data, response, session, callback) {
	if ( session && session.email && session.token ) {
		mongoActions.checkToken(session, response, function (token, user) {
			sessionActions.setSessionData(session, token, session);
			( callback ) && callback(user);
		});
	}
	else {
		responseActions.sendResponse(response, 401);
	}
}

function registration (data, response, session) {
	if ( data.email && data.password && data.nickname ) {
		mongoActions.insertUser(data, response, function (token) {
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
	}
	
}

function login (data, response, session) {
	if ( data.email && data.password ) {
		mongoActions.userLogin(data, response, function (token) {
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.cookie});
	}	
}

function logout (data, response, session) {
	if( session ) {
		sessionActions.setSessionData({}, '', session);
		responseActions.sendResponse(response, 200);
	}
	else {
		responseActions.sendResponse(response, 401);
	}
}

function checkEmail (data, response, session) {
	mongoActions.checkEmail(data, response);
}

function checkNickname (data, response, session) {
	mongoActions.checkNickname(data, response);
}

function createTalk (data, response, session) {
	checkIsUserLogined(data, response, session, function (user) {
		if ( data.title ) {
			if ( user.rating > 20 ) {
				mongoActions.addTalk(data, user, response);
			}
			else {
				responseActions.sendResponse(response, 403, {field: 'rating', message: responseActions.errors.rating});
			}
		}
		else {
			responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
		}
	});
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;
exports.checkLogin = checkLogin;
exports.logout = logout;
exports.createTalk = createTalk;