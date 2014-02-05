var crypto = require('crypto');

function registration (data, response) {
	var login = data.login,
		password = data.password,
		cryptoPass = crypto.createHash('md5').update(password).digest('hex');
}

exports.registration = registration;