function route(handle, pathname, data, response) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](data, response);
	} else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;