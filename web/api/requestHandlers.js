function registration (data, response, mongodb) {
	mongodb.insertUser(data, response);	
}

function login (data, response, mongodb) {
	mongodb.userLogin(data, response);
}

function checkEmail (data, response, mongodb) {
	mongodb.checkEmail(data, response);
}

function checkNickname (data, response, mongodb) {
	mongodb.checkNickname(data, response);
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;