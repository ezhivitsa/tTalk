var mongodb = require('./mongodb'),
	sessionActions = require('./sessionActions'),
	responseActions = require('./responseActions');

function checkLogin (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		responseActions.sendResponse(response, 200);
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
		responseActions.sendResponse(response, 401);
	}
}

function registration (data, response, session) {
	if ( data.email && data.password && data.nickname ) {
		mongodb.insertUser(data, response, function (token) {
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
	}
	
}

function login (data, response, session) {
	if ( data.email && data.password ) {
		mongodb.userLogin(data, response, function (token) {
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
	mongodb.checkEmail(data, response);
}

function checkNickname (data, response, session) {
	mongodb.checkNickname(data, response);
}

function createTalk (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		if ( data.title && data.author ) {

		}
		else {

		}
		console.log('talk creation');
	});
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;
exports.checkLogin = checkLogin;
exports.logout = logout;
exports.createTalk = createTalk;