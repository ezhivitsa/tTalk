function createSession (user, request) {
	request.session.authorized = true;
    request.session.username = request.body.login;
}

exports.createSession = createSession;