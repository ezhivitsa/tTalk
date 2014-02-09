var mongodb = require('./mongodb'),
	sessionActions = require('./sessionActions');

function registration (data, response, session) {
	mongodb.insertUser(data, response, function (token) {
		sessionActions.setSessionData(data, token, session);
	});	
}

function login (data, response, session) {
	mongodb.userLogin(data, response);
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