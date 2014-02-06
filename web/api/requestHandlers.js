function registration (data, request, response, mongodb) {
	mongodb.insertUser(data, response);	
}

function login(data, request, response, mongodb) {
	mongodb.userLogin(data, response);
}

exports.registration = registration;
exports.login = login;