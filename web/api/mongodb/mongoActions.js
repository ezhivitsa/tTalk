var mongodb = require('./mongodb.js'),
	crypto = require('crypto'),
	responseActions = require('../responseActions.js'),
	mongo = require('mongodb'),
	BSON = mongo.BSONPure;

var db = null,
	collections = {},
	userRoles = {
		admin: 'admin',
		client: 'client'
	}

function setDB(dataBase) {
	db = dataBase;
	collections = {
		comments: db.collection('comments'),
		users: db.collection('users'),
		talks: db.collection('talks')
	};
}

function handleDbError(response, err, item, callback) {
	if ( err ) {
		responseActions.sendDataBaseError(response, err);
	}
	else {
		if ( item || ( item instanceof Array && item.length ) ) {
			( callback ) && callback(item);			
		}
		else {
			responseActions.sendResponse(response, 404, {message: responseActions.errors.notFound});
		}
	}
}

var usersCtrl = (function () {
	return {
		setUserToken: function(data, response, callback) {
			crypto.randomBytes(48, function(ex, buf) {
				var token = buf.toString('hex'),
					collection = db.collection('users');

				collection.findAndModify({email: data.email}, [['email', 1]], {$set: {token: token}}, {}, function (err, object) {
					if ( err ) {
						responseActions.sendDataBaseError(response, err);
					}
					else {
						( callback ) && callback(token, data);
					}
				});
			});
		},
		checkToken: function(data, response, callback) {
			usersCtrl.compareToken(data, response, callback);
		},
		compareToken: function(data, response, callback) {
			var collection = db.collection('users');
			collection.findOne({email: data.email}, function (err, item) {
				if ( err ) {
					responseActions.sendDataBaseError(response, err);
				}
				else {
					if ( item.token == data.token ) {
						usersCtrl.setUserToken(item, response, callback);
					}
					else {
						responseActions.sendResponse(response, 401);
					}
				}
			});
		},
		userLogin: function(user, response, callback) {
			var email = user.email,
				password = user.password,
				cryptoPass = crypto.createHash('md5').update(password).digest('hex');

			collections.users.findOne({email: email}, function (err, item) {

				handleDbError(response, err, item, function (item) {
					if ( item && item.password === cryptoPass ) {
						usersCtrl.setUserToken(item, response, callback);
					}
					else {
						responseActions.sendResponse(response, 403);
					}
				});
			});
		},
		insertUser: function(userData, response, callback) {
			var email = userData.email,
				password = userData.password,
				nickname = userData.nickname,
				firstName = userData.firstName,
				lastName = userData.lastName;

			var cryptoPass = crypto.createHash('md5').update(password).digest('hex'),
				data = {
					email: email,
					password: cryptoPass,
					nickname: nickname,
					rating: 0,
					talks: [],
					subscribedTalks: [],
					role: userRoles.client
				};

			if ( firstName ) {
				data.firstName = firstName;
			}
			if ( lastName ) {
				data.lastName = lastName;
			}

			usersCtrl.checkEmail(email, response, function () {
				usersCtrl.checkNickname(nickname, response, function () {
					usersCtrl.registerUser(data, response, function () {
						usersCtrl.setUserToken(data, response, callback);
					});
				});
			});
		},
		registerUser: function(data, response, callback) {
			collections.users.insert(data, {w: 1, unique: true}, function (err, result) {
				handleDbError(response, err, result, function (result) {
					( callback ) && callback();
				});		
			});
		},
		checkEmail: function(email, response, callback) {
			var expr = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

			if ( expr.test(email) ) {
				collections.users.findOne({email: email}, function (err, item) {
					if ( err ) {
						responseActions.sendDataBaseError(response, err);
					}
					else {
						if ( item ) {
							responseActions.sendResponse(response, 403, {field: 'email', message: responseActions.errors.emailExist});
						}
						else {
							( callback ) && callback();
						}
					}
				});
			}
			else {
				responseActions.sendResponse(response, 403, {field: 'email', message: responseActions.errors.invalidEmail});
			}
		},
		checkNickname: function(nickname, response, callback) {
			collections.users.findOne({nickname: nickname}, function (err, item) {
				if ( err ) {
					responseActions.sendDataBaseError(response, err);
				}
				else {
					if ( item ) {
						responseActions.sendResponse(response, 403, {field: 'nickname', message: responseActions.errors.nicknameExist});
					}
					else {
						( callback ) && callback();
					}
				}
			});
		},
		getUser: function(data, response) {
			var fields = {
				firstName: 1,
				lastName: 1,
				nickname: 1,
				city: 1,
				about: 1,
				job: 1,
				talks: 1
			};
			collections.users.findOne({nickname: data.nickname}, fields, function (err, item) {

				handleDbError(response, err, item, function (item) {
					var talkFields = ['title'],
						idTalks = item.talks || [];
					idTalks.reverse();
					item.talksNumber = idTalks.length;
					collections.talks.find({'_id': { $in: idTalks}}, talkFields).toArray(function(err, docs){

						handleDbError(response, err, docs, function (docs) {
							item.talks = docs || [];
							responseActions.sendResponse(response, 200, item);
						});
					});
				});
			});
		},
		changeAccount: function(data, response) {
			var newData = {
					password: data.password,
					city: (data.city) ? data.city : '',
					firstName: (data.firstName) ? data.firstName : '',
					lastName: (data.lastName) ? data.lastName : '',
					about: (data.about) ? data.about : '',
					job: (data.job) ? data.job : ''
				};
			collections.users.findAndModify({_id: data.id}, [['email', 1]], {$set: newData}, {}, function (err, object) {
				handleDbError(response, err, object, function (object) {
					responseActions.sendResponse(response, 200);
				});
			});
		}
	};
})();

var commentsCtrl = (function () {
	return {
		addComment: function(data, user, response) {
			var now = new Date(),
				comment = {
					userId: user._id,
					talkId: data.id,
					text: data.text,
					rating: 0,
					evaluators: [],
					created: now.getTime() + 60 * 1000 * now.getTimezoneOffset(),
					isActual: true
				};

			collections.comments.insert(comment, {w: 1, unique: true}, function (err, result) {
				handleDbError(response, err, result, function (result) {

					var o_id = new BSON.ObjectID(data.id);
					collections.talks.findOne({_id: o_id, isActual: true}, function (err, item) {
						handleDbError(response, err, item, function (item) {
							//update talk
							item.comments.push(result[0]._id);
							collections.talks.update({_id: o_id}, {$set: {comments: item.comments}}, function (err) {

								handleDbError(response, err, {}, function () {
									responseActions.sendResponse(response, 200);
								});
							});
						});
					});
				});
			});
		},
		getComments: function (data, user, response) {
			var page = parseInt(data.page) || 1,
				pageSize = parseInt(data.page_size) || 10,
				fields = {
					text: 1,
					rating: 1,
					userId: 1,
					evaluators: 1,
					isActual: 1
				}

			collections.comments.find({talkId: data.id}, fields, {
				sort: {created: -1},
				skip: pageSize * (page - 1),
				limit: pageSize + 1
			}).toArray(function (err, items) {

				handleDbError(response, err, items, function (items) {
					var len = items.length,
						isEnd = true;
					if ( items.length == pageSize + 1 ) {
						len--;
						isEnd = false;
						items = items.slice(0, len);
					}

					var users = {},
						usersArr = [];
					for ( var i = 0, len = items.length; i < len; i++ ) {
						users[items[i].userId.toString()] = items[i].userId;
					}
					for ( userId in users ) {
						usersArr.push(users[userId]);
					}
					var userFields = {
						nickname: 1
					}

					collections.users.find({'_id': { $in: usersArr}}, userFields).toArray(function (err, colUsers) {

						handleDbError(response, err, colUsers, function (colUsers) {
							var usersId = {};
							for ( var i = 0, len = colUsers.length; i < len; i++ ) {
								usersId[colUsers[i]._id.toString()] = colUsers[i];
							}

							for ( var i = 0, len = items.length; i < len; i++ ) {
								items[i].author = usersId[items[i].userId.toString()];

								if ( !items[i].isActual ) {
									items[i].isCanEvaluate = false;
									delete items[i]['text'];
								}
								else {
									// if comment is actual it can be evaluated
									items[i].isCanEvaluate = (user._id.toString() != items[i].userId.toString());
									items[i].isCanDelete = (user._id.toString() === items[i].userId.toString() || user.role === userRoles.admin);
									if ( items[i].isCanEvaluate ) {
										for ( var j = 0; j < items[i].evaluators.length; j++ ) {
											if ( items[i].evaluators[j].toString() == user._id.toString() ) {
												items[i].isCanEvaluate = false;
												break;
											}
										}
									}									
								}

								delete items[i]['evaluators'];
							}

							responseActions.sendResponse(response, 200, {comments: items, isEnd: isEnd});
						});

					});
				});

			});
		},
		evaluate: function (data, user, response) {
			var commentId = new BSON.ObjectID(data.id);
			collections.comments.findOne({_id: commentId}, function (err, comment) {
				handleDbError(response, err, comment, function (comment) {
					if ( !comment.isActual ) {
						responseActions.sendResponse(response, 403, {message: responseActions.errors.evaluateComment});
						return;
					}
					if ( comment.userId.toString() == user._id.toString() ) {
						responseActions.sendResponse(response, 403, {message: responseActions.errors.evaluateComment});
						return;
					}

					for ( var i = 0, len = comment.evaluators.length; i < len; i++ ) {
						if ( comment.evaluators[i].toString() == user._id.toString() ) {
							responseActions.sendResponse(response, 403, {message: responseActions.errors.evaluateComment});
							return;
						}
					}

					var mark = ( parseFloat(data.mark) >= 1 ) ? 1 : -1,
						coefficient = 1;

					comment.evaluators.push(user._id);
					comment.rating += mark;
					//update comment evaluators and rating
					collections.comments.update({_id: commentId}, {$set: {
						evaluators: comment.evaluators,
						rating: comment.rating
					}}, function (err) {
						handleDbError(response, err, {}, function () {

							collections.users.findOne({_id: comment.userId}, function (err, author) {
								handleDbError(response, err, author, function (author) {
									//update user rating
									author.rating += mark * coefficient;
									collections.users.update({_id: comment.userId}, {$set: {
										rating: author.rating
									}}, function (err) {

										handleDbError(response, err, {}, function () {
											responseActions.sendResponse(response, 200, {rating: comment.rating});
										});

									});
								});
							});

						});
					});

				});
			});
		},
		delete: function (data, user, response) {
			var commentId = new BSON.ObjectID(data.id);
			collections.comments.findOne({_id: commentId}, function (err, comment) {
				handleDbError(response, err, comment, function (comment) {
					if ( !comment.isActual || ( comment.userId.toString() != user._id.toString() && user.role != userRoles.admin ) ) {
						responseActions.sendResponse(response, 403, {message: responseActions.errors.deleteComment});
						return;
					}

					collections.comments.update({_id: commentId}, {$set: {isActual: false}}, function (err) {
						handleDbError(response, err, {}, function () {
							responseActions.sendResponse(response, 200);
						});
					});
				});
			});
		}
	};
})();

var talksCtrl = (function () {

	function getTalkParticipants(item, response, callback) {
		var userFields = {
			nickname: 1
		}

		collections.users.find({'_id': { $in: item.participants}}, userFields).toArray(function (err, users) {

			handleDbError(response, err, users, function (users) {
				var usersId = {};
				for ( var i = 0, len = users.length; i < len; i++ ) {
					usersId[users[i]._id.toString()] = users[i];
				}

				for ( var i = 0, len = item.participants.length; i < len; i++ ) {
					item.participants[i] = usersId[item.participants[i].toString()];
				}
				( callback ) ? callback(item) : responseActions.sendResponse(response, 200, item.participants);
			});

		});
	}

	return {
		addTalk: function(talk, user, response, callback) {
			var now = new Date(),
				date = new Date(talk.date);

			talk.participants = [];
			talk.numberOfParticipants = 0;
			talk.participants = [];
			talk.evaluators = [];
			talk.comments = [];
			talk.rating = 0;
			talk.author = user._id;
			talk.created = now.getTime() + 60 * 1000 * now.getTimezoneOffset();
			talk.lastModified = now.getTime() + 60 * 1000 * now.getTimezoneOffset();
			talk.date = date.getTime() + 60 * 1000 * date.getTimezoneOffset();
			talk.isActual = true;

			if ( talk.date != talk.date ) {
				responseActions.sendResponse(response, 403, {field: 'date', message: responseActions.errors.date});
				return;
			}

			collections.talks.insert(talk, {w: 1, unique: true}, function (err, result) {
				handleDbError(response, err, result, function (result) {

					collections.users.findOne({email: user.email}, function (err, item) {
						handleDbError(response, err, item, function (item) {
							item.talks.push(result[0]._id);
							collections.users.update({email: user.email}, {$set: {talks: item.talks}});
							( callback ) ? callback(result[0]._id) : responseActions.sendResponse(response, 200, {id: result[0]._id});
						});	
					});	
				});
			});
		},
		getAllTalks: function(data, response) {
			data.page_size = parseInt(data.page_size);
			data.page = parseInt(data.page);
			var perPage = ( data.page_size < 1 || !data.page_size ) ? 10 : parseInt(data.page_size),
				page = ( data.page < 1 || !data.page ) ? 1 : data.page,
				result = [];

			collections.talks.find({isActual: true}, {title: 1, date: 1, path: 1, extension: 1}, {
				sort: {date: -1}, 
				skip: perPage * (page - 1), 
				limit: perPage + 1
			}).toArray(function (err, items) {

				handleDbError(response, err, items, function (items) {
					var len = items.length,
						isEnd = true;
					if ( items.length == perPage + 1 ) {
						len--;
						isEnd = false;
						items = items.slice(0, len);
					}
					for ( var i = 0; i < len; i++ ) {
						items[i].image = items[i].path + items[i]._id + items[i].extension;
					}
					responseActions.sendResponse(response, 200, {talks: items, isEnd: isEnd});
				});
			});
		},
		getTalk: function(data, user, response) {
			var fields = {
					title: 1,
					description: 1,
					path: 1,
					extension: 1,
					date: 1,
					author: 1,
					numberOfParticipants: 1,
					rating: 1,
					participants: 1,
					evaluators: 1,
					isActual: 1
				},
				o_id = new BSON.ObjectID(data.id);

			collections.talks.findOne({_id: o_id, isActual: true}, fields, {
				sort: {rating: -1},
				limit: 10
			}, function (err, item) {
				handleDbError(response, err, item, function (item) {

					if ( !item.isActual ) {
						responseActions.sendResponse(response, 418, {message: responseActions.errors.teapot});
						return;
					}
						
					item.image = item.path + item._id + item.extension;
					var userFields = {
							nickname: 1
						};

					collections.users.findOne({_id: item.author}, userFields, function (err, authUser) {
						handleDbError(response, err, authUser, function (authUser) {
							item.author = authUser;
							item.isCanSubscribe = item.isCanEvaluate = (authUser._id.toString() != user._id.toString());
							items[i].isCanDelete = (user._id.toString() === authUser._id.toString() || user.role === userRoles.admin);
							
							if ( item.isCanSubscribe ) {
								for ( var i = 0, len = item.participants.length; i < len; i++ ) {
									if ( item.participants[i].toString() == user._id.toString() ) {
										item.isCanSubscribe = false;
										break;
									}
								}
							}
							if ( !item.isCanSubscribe ) {
								//get nicknames of the participants
								getTalkParticipants(item, response, function (talk) {
									for ( var i = 0, len = talk.evaluators.length; i < len; i++ ) {
										if ( user._id.toString() == talk.evaluators[i].toString() ) {
											talk.isCanEvaluate = false;
											break;
										}
									}
									delete talk['evaluators'];
									responseActions.sendResponse(response, 200, talk);
								});
							}
							else {
								item.participants = [];
								delete item['evaluators'];							
								responseActions.sendResponse(response, 200, item);
							}
						});
					});					
				});				
			});
		},
		subscribe: function (data, user, response) {
			var talk_id = new BSON.ObjectID(data.id);
			//update talks collection
			collections.talks.findOne({
				_id: talk_id,
				isActual: true
			}, function (err, item) {
				handleDbError(response, err, item, function (item) {
					if ( item.author.toString() == user._id.toString() ) {
						responseActions.sendResponse(response, 403, {field: 'subscribe', message: responseActions.errors.subscribe});
						return;
					}

					for ( var i = 0, len = item.participants.length; i < len; i++ ) {
						if ( item.participants[i].toString() == user._id.toString() ) {
							responseActions.sendResponse(response, 403, {field: 'subscribe', message: responseActions.errors.subscribe});
							return;
						}
					}

					item.participants.push(user._id);
					item.numberOfParticipants++;

					collections.talks.update({_id: talk_id}, {$set: {
							participants: item.participants, 
							numberOfParticipants: item.numberOfParticipants
						}}, function (err) {
						//if update of the talk was successful
						handleDbError(response, err, {}, function () {
							user.subscribedTalks.push(talk_id);

							collections.users.update({email: user.email}, {$set: {subscribedTalks: user.subscribedTalks}}, function (err) {
								//if update of the user was successful
								handleDbError(response, err, {}, function () {
									// get participants of the talk
									getTalkParticipants(item, response);
								});
							});
						});
					});
				});
			});
		},
		evaluate: function (data, user, response) {
			var talkId = new BSON.ObjectID(data.id);
			collections.talks.findOne({
				_id: talkId,
				isActual: true
			}, function (err, talk) {
				handleDbError(response, err, talk, function (talk) {
					if ( talk.author.toString() == user._id.toString() ) {
						responseActions.sendResponse(response, 403, {message: responseActions.errors.evaluateTalk});
						return;
					}
					for ( var i = 0, len = talk.evaluators.length; i < len; i++ ) {
						if ( talk.evaluators[i].toString() == user._id.toString() ) {
							responseActions.sendResponse(response, 403, {message: responseActions.errors.evaluateTalk});
							return;
						}
					}

					var mark = ( parseFloat(data.mark) >= 1 ) ? 1 : -1,
						coefficient = 1;

					talk.evaluators.push(user._id)

					//updating talk in the db
					collections.talks.update({_id: talkId}, {$set: {
						evaluators: talk.evaluators,
						rating: talk.rating + mark
					}}, function (err) {

						handleDbError(response, err, {}, function () {
							collections.users.findOne({_id: talk.author}, function (err, author) {
								handleDbError(response, err, author, function (author) {
									//update rating of the talk author
									collections.users.update({_id: talk.author}, {$set: {
										rating: author.rating + mark * coefficient
									}}, function (err) {
										//if update of the user was successful
										handleDbError(response, err, {}, function () {
											responseActions.sendResponse(response, 200, {rating: talk.rating + mark});
										});
									});
								});
							});
						});

					});
				});
			});
		},
		delete: function (data, user, response) {
			var talkId = new BSON.ObjectID(data.id);
			collections.talks.findOne({_id: talkId, isActual: true}, function (err, talk) {
				handleDbError(response, err, talk, function (talk) {
					if ( !talk.isActual || ( talk.author.toString() != user._id.toString() && user.role != userRoles.admin ) ) {
						responseActions.sendResponse(response, 403, {message: responseActions.errors.deleteTalk});
						return;
					}

					collections.comments.update({_id: talkId}, {$set: {isActual: false}}, function (err) {
						handleDbError(response, err, {}, function () {
							responseActions.sendResponse(response, 200);
						});
					});
				});
			});
		}
	};
})();

exports.setDB = setDB;
exports.usersCtrl = usersCtrl;
exports.talksCtrl = talksCtrl;
exports.commentsCtrl = commentsCtrl;