var mongoActions = require('./mongodb/mongoActions.js'),
	sessionActions = require('./session/sessionActions.js'),
	responseActions = require('./responseActions.js'),
	formidable = require('formidable'),
	fs = require('fs-extra'),
	crypto = require('crypto');

var requestHandler = (function () {
	function checkIsUserLogined (data, response, session, callback) {
		if ( session && session.email && session.token ) {
			mongoActions.usersCtrl.checkToken(session, response, function (token, user) {
				sessionActions.setSessionData(session, token, session);
				( callback ) && callback(user);
			});
		}
		else {
			responseActions.sendResponse(response, 401);
		}
	}

	return {		
		registration: {
			post: function (data, response, session) {
				if ( data.email && data.password && data.nickname ) {
					if ( 6 <= data.password.length && data.password.length <= 20 ) {
						mongoActions.usersCtrl.insertUser(data, response, function (token, data) {
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
						responseActions.sendResponse(response, 403, {field: 'password', message: responseActions.errors.password});
					}
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}	
			}
		},
		checkEmail: {
			post: function  (data, response, session) {
				mongoActions.usersCtrl.checkEmail(data.email, response, function () {
					responseActions.sendResponse(response, 200);
				});
			}
		},
		checkNickname: {
			post: function  (data, response, session) {
				mongoActions.usersCtrl.checkNickname(data.nickname, response, function () {
					responseActions.sendResponse(response, 200);
				});
			}
		},
		checkLogin: {
			get: function (data, response, session) {
				checkIsUserLogined(data, response, session, function () {
					responseActions.sendResponse(response, 200);
				});
			}
		},
		login: {
			post: function (data, response, session) {
				if ( data.email && data.password ) {
					mongoActions.usersCtrl.userLogin(data, response, function (token, data) {
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
		},
		logout: {
			get: function (data, response, session) {
				if( session ) {
					sessionActions.setSessionData({}, '', session);
					responseActions.sendResponse(response, 200);
				}
				else {
					responseActions.sendResponse(response, 403);
				}
			}
		},
		createTalk: {
			post: function (data, response, session, request) {
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

									mongoActions.talksCtrl.addTalk(formFields, user, response, function (talkId) {
								        var new_location = '../content/uploads/img/',
											temp_path = file.path,
								        	file_name = talkId + formFields.extension;

								        fs.copy(temp_path, new_location + file_name, function(err) {  
								            if ( err ) {
								            	responseActions.sendResponse(response, 403, {field: 'upload', message: responseActions.errors.upload});
								            } 
								            else {
								                responseActions.sendResponse(response, 200, {id: talkId});
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
		},
		talks: {
			get: function (data, response, session) {
				checkIsUserLogined(data, response, session, function () {
					mongoActions.talksCtrl.getAllTalks(data, response);
				});
			}
		},
		talk: {
			get: function (data, response, session) {
				if ( data.id && data.id.length == 24 ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.talksCtrl.getTalk(data, user, response);
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}			
		},
		myAccount: {
			get: function (data, response, session) {
				checkIsUserLogined(data, response, session, function (user) {
					var userInfo = {
						email: user.email,
						nickname: user.nickname,
						firstName: ( user.firstName ) ? user.firstName : '',
						lastName: ( user.lastName ) ? user.lastName : '',
						city: ( user.city ) ? user.city : '',
						about: ( user.about ) ? user.about : '',
						job: ( user.job ) ? user.job : ''
					};
					responseActions.sendResponse(response, 200, userInfo);
				});
			},
			post: function (data, response, session) {
				if ( data.password.length < 6 || data.password.length > 20 ) {
					responseActions.sendResponse(response, 403, {field: 'password', message: responseActions.errors.password});
				}
				else {
					checkIsUserLogined(data, response, session, function (user) {
						data.id = user._id;
						if ( !data.password || data.password === '' ) {
							data.password = user.password;
						}
						else {
							var cryptoPass = crypto.createHash('md5').update(data.password).digest('hex');
							data.password = cryptoPass;
						}			
						mongoActions.usersCtrl.changeAccount(data, response);
					});					
				}
			}
		},
		user: {
			get: function (data, response, session) {
				if ( data.nickname ) {
					checkIsUserLogined(data, response, session, function () {						
						mongoActions.usersCtrl.getUser(data, response);						
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		},
		subscribe: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 ) {
					checkIsUserLogined(data, response, session, function (user) {
						if ( user.subscribedTalks.indexOf(data.id) + 1 ) {
							responseActions.sendResponse(response, 403, {field: 'subscribe', message: responseActions.errors.subscribe});	
						}
						else {
							mongoActions.talksCtrl.subscribe(data, user, response);
						}
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});					
				}
			}
		},
		comment: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 && data.text ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.commentsCtrl.addComment(data, user, response);
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			} 
		},
		comments: {
			get: function (data, response, session) {
				if ( data.id && data.id.length == 24 ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.commentsCtrl.getComments(data, user, response);
					});					
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		},
		evaluateComment: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 && data.mark ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.commentsCtrl.evaluate(data, user, response);
					});	
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		},
		deleteComment: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.commentsCtrl.delete(data, user, response);
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		},
		evaluateTalk: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 && data.mark ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.talksCtrl.evaluate(data, user, response);
					});	
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		},
		deleteTalk: {
			post: function (data, response, session) {
				if ( data.id && data.id.length == 24 ) {
					checkIsUserLogined(data, response, session, function (user) {
						mongoActions.talksCtrl.delete(data, user, response);
					});
				}
				else {
					responseActions.sendResponse(response, 403, {field: 'data', message: responseActions.errors.data});
				}
			}
		}
	}
})();

exports.handler = requestHandler;