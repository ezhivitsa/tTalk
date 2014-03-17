var errors = {
	data: 'Not all data',
	cookie: 'Errors with cookie',
	nicknameExist: 'This nickname is already in use',
	emailExist: 'This email is already in use',
	dbErrod: 'Database error',
	invalidEmail: 'Invalid email',
	rating: 'Rating of the user less than 20'
}

function sendResponse (response, statusCode, responseJSON) {
	responseJSON = responseJSON || {};
	response.writeHead(statusCode, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(responseJSON));
}

function sendDataBaseError (response, err) {
	console.warn(err.message);
	response.writeHead(500, {'Content-Type': 'application/json'});
	response.end(JSON.stringify({error: dbErrod}));
}

exports.errors = errors;
exports.sendResponse = sendResponse;
exports.sendDataBaseError = sendDataBaseError;