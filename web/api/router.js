function route(method, handler, pathname, data, response, session, request) {
	var functionName = handler.handle[pathname];
	if ( handler[functionName] && handler[functionName][method] ) {
		if ( pathname === '/api/createtalk' ) {				
			handler[functionName][method](data, response, session, request);				
		}
		else {
			handler[functionName][method](data, response, session);
		}
	} 
	else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;