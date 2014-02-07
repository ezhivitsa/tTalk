function registration (data, response, mongodb) {
	mongodb.insertUser(data, response);	
}

function login(data, response, mongodb) {
	mongodb.userLogin(data, response);
}

exports.registration = registration;
exports.login = login;