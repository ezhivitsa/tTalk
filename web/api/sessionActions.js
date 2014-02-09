function setSessionData (data, token, session) {
	console.log(session);
	session.authorized = true;
	session.email = data.email;
	session.token = token;
}

exports.setSessionData = setSessionData;