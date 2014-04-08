var mongoActions = require('./mongodb/mongoActions.js'),
	sessionActions = require('./session/sessionActions.js'),
	responseActions = require('./responseActions.js'),
	formidable = require('formidable'),
	fs = require('fs-extra');

function checkLogin (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		responseActions.sendResponse(response, 200);
	});
}

function checkIsUserLogined (data, response, session, callback) {
	if ( session && session.email && session.token ) {
		mongoActions.checkToken(session, response, function (token, user) {
			sessionActions.setSessionData(session, token, session);
			( callback ) && callback(user);
		});
	}
	else {
		responseActions.sendResponse(response, 401);
	}
}

function registration (data, response, session) {
	if ( data.email && data.password && data.nickname ) {
		mongoActions.insertUser(data, response, function (token, data) {
			responseActions.sendResponse(response, 200, {
				nickname: data.nickname,
				firstName: data.firstName,
				lastName: data.lastName,
				isPositiveRating: (data.rating > 20)
			});
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
	}
	
}

function login (data, response, session) {
	if ( data.email && data.password ) {
		mongoActions.userLogin(data, response, function (token, data) {
			responseActions.sendResponse(response, 200, {
				nickname: data.nickname,
				firstName: data.firstName,
				lastName: data.lastName,
				isPositiveRating: (data.rating > 20)
			});
			sessionActions.setSessionData(data, token, session);
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.cookie});
	}	
}

function logout (data, response, session) {
	if( session ) {
		sessionActions.setSessionData({}, '', session);
		responseActions.sendResponse(response, 200);
	}
	else {
		responseActions.sendResponse(response, 403);
	}
}

function checkEmail (data, response, session) {
	mongoActions.checkEmail(data, response);
}

function checkNickname (data, response, session) {
	mongoActions.checkNickname(data, response);
}

function createTalk (data, response, session, request) {
	checkIsUserLogined(data, response, session, function (user) {
		if ( user.rating > 20 ) {
			var form = new formidable.IncomingForm(),
				formFields = null;
	    	form.parse(request, function(err, fields, files) {
		   		if ( fields.title && fields.date ) {
		   			formFields = fields;
		   			if ( !fields.description ) {
		   				formFields.description = '';
		   			}
		    	}
		    	else {
		    		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
		    	}
		    });
		    form.on('error', function(err) {
		        responseActions.sendResponse(response, 403, {field: 'upload', message: responseActions.errors.upload});
		    });

		    form.on('end', function(fields, files) {
		    	var type = this.openedFiles[0].type,
		    		file = this.openedFiles[0];

		    	if ( type.indexOf('image/') + 1 ) {
		    		if ( formFields ) {
		    			var name = file.name
		    			formFields.extension = file.name.substring(file.name.lastIndexOf('.'));
		    			formFields.path = './uploads/img/'

						mongoActions.addTalk(formFields, user, response, function (talkId) {
					        var new_location = '../content/uploads/img/',
								temp_path = file.path,
					        	file_name = talkId + formFields.extension;

					        fs.copy(temp_path, new_location + file_name, function(err) {  
					            if ( err ) {
					            	responseActions.sendResponse(response, 403, {field: 'upload', message: responseActions.errors.upload});
					            } 
					            else {
					                responseActions.sendResponse(response, 200, talkId);
					            }
					        });				 
						});

		    		}
		    	}
		    	else {
		    		responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.filetype});
		    	} 
		    });  	
		}
		else {
			responseActions.sendResponse(response, 403, {field: 'rating', message: responseActions.errors.rating});
		}
	});
}

function getTalks (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		mongoActions.getAllTalks(data, response);
	});
}

function getTalk (data, response, session) {
	checkIsUserLogined(data, response, session, function () {
		mongoActions.getTalk(data, response);
	});
}

function myAccount (data, response, session) {
	checkIsUserLogined(data, response, session, function (user) {
		var userInfo = {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			nickname: user.nickname
		};
		responseActions.sendResponse(response, 200, userInfo);
	});
}

exports.registration = registration;
exports.login = login;
exports.checkEmail = checkEmail;
exports.checkNickname = checkNickname;
exports.checkLogin = checkLogin;
exports.logout = logout;
exports.createTalk = createTalk;
exports.getTalks = getTalks;
exports.getTalk = getTalk;
exports.myAccount = myAccount;