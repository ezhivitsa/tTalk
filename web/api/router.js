function route(handle, pathname, data, request, response, mongodb) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](data, request, response, mongodb);
	} else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;