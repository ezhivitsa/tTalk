var errors = {
	data: 'Not all data',
	cookie: 'Errors with cookie',
	nicknameExist: 'This nickname is already in use',
	password: 'Incorrect password',
	emailExist: 'This email is already in use',
	dbErrod: 'Database error',
	invalidEmail: 'Invalid email',
	rating: 'Rating of the user less than 20',
	upload: 'Error of the file upload',
	filetype: 'Incorrect type of the file',
	date: 'Invalid date',
	subscribe: 'You are already subscribed to this talk',
	evaluateComment: 'You can\'t evaluate this comment',
	deleteComment: 'You can\'t delete this comment',
	evaluateTalk: 'You can\'t evaluate this talk',
	teapot: 'Sorry, but this is talk was removed'
}

function sendResponse (response, statusCode, responseJSON) {
	responseJSON = responseJSON || {};
	response.writeHead(statusCode, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(responseJSON));
}

function sendDataBaseError (response, err) {
	console.warn(err.message);
	response.writeHead(500, {'Content-Type': 'application/json'});
	response.end(JSON.stringify({error: errors.dbErrod}));
}

exports.errors = errors;
exports.sendResponse = sendResponse;
exports.sendDataBaseError = sendDataBaseError;