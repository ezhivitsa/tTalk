var Session = require('./Session.js').Session
 
module.exports.SessionHandler = function (cookieName, maxAge, checkInterval) {
	var cookieName = cookieName ? cookieName : 'SESSION';
	var maxAge = maxAge ? maxAge * 1000 : 3600000; //60 minutes
	var checkInterval = checkInterval ? checkInterval : 1000; //default 1 sec.
	var sessions = new Array();
 
	this.forEachSession = function (callback) {
		for (var key in sessions) { 
			callback(sessions[key]);
		}
	}
 
	this.deleteSession = function (session) {
		if (sessions[session]) {
			delete sessions[session];
			return true;
		}
		return false;
	}
 
	this.getSession = function (request, response) {
		var cookie = request.headers.cookie;
		if (cookie && cookie.indexOf(cookieName) !== -1) { //cookie found
			var start = cookie.indexOf(cookieName) + cookieName.length + 1;
			var end = cookie.indexOf('; ', start);
			end = end === -1 ? cookie.length : end;
			var value = cookie.substring(start, end);
 
			if (sessions[value]) {
				return sessions[value];
			}
		}
 
		var session = new Session();
		response.setHeader('Set-Cookie', [cookieName + '=' + session + ';Max-Age=' + maxAge / 1000]);
		return sessions[session] = session;
	}
 
	//garbage collection
	setInterval(function () {
		var now = new Date().getTime();
		for (var key in sessions) {
			var session = sessions[key];
 
			if (session.doDestroy) {
				delete sessions[key];
			}
 
			if (now - session.getTime() > maxAge) {
				delete sessions[key];
			}
		}
	}, checkInterval);
}