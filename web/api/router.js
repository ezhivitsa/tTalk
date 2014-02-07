function route(handle, pathname, data, response, mongodb) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](data, response, mongodb);
	} else {
		console.log("No request handler found for " + pathname);
	}
}

exports.route = route;