function route(handle, pathname, data, response, session, request) {
	if (typeof handle[pathname] === 'function') {
		if ( pathname === '/api/upload' ) {
			handle[pathname](data, response, session, request);
		}
		else {
			handle[pathname](data, response, session);
		}
	} 
	else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;