function route(handle, pathname, data, response, session) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](data, response, session);
	} else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;