var errors = {
	data: 'Not all data',
	cookie: 'Errors with cookie',
	nicknameExist: 'This nickname is already in use',
	emailExist: 'This email is already in use',
	dbErrod: 'Database error',
	invalidEmail: 'Invalid email'
}

function sendResponse (response, statusCode, responseJSON, db) {
	responseJSON = responseJSON || {};
	response.writeHead(statusCode, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(responseJSON));
	( db ) && db.close();
}

function sendDataBaseError (response, err, db) {
	console.warn(err.message);
	response.writeHead(500, {'Content-Type': 'application/json'});
	response.end(JSON.stringify({error: dbErrod}));
	db.close();
}

exports.errors = errors;
exports.sendResponse = sendResponse;