function setSessionData (data, token, session) {	
	session.authorized = true;
	session.email = data.email;
	session.token = token;
	console.log(session);
}

exports.setSessionData = setSessionData;