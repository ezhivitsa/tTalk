var mongodb = require('./mongodb.js'),
	crypto = require('crypto'),
	responseActions = require('../responseActions.js'),
	mongo = require('mongodb'),
	BSON = mongo.BSONPure;

var db = null,
	collections = {};

function setDB(dataBase) {
	db = dataBase;
	collections = {
		comments: db.collection('collections'),
		users: db.collection('users'),
		talks: db.collection('talks')
	};
}

function insertUser(userData, response, callback) {
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
			subscribedTalks: []
		};

	if ( firstName ) {
		data.firstName = firstName;
	}
	if ( lastName ) {
		data.lastName = lastName;
	}

	checkEmail(email, response, function () {
		checkNickname(nickname, response, function () {
			registerUser(data, response, function () {
				setUserToken(data, response, callback);
			});
		});
	});
}

function checkEmail (email, response, callback) {
	var expr = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	if ( expr.test(email) && email.length >= 6 && email.length <= 20 ) {
		var collection = db.collection('users');
		collection.findOne({email: email}, function (err, item) {
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
}

function checkNickname (nickname, response, callback) {
	var collection = db.collection('users');
	collection.findOne({nickname: nickname}, function (err, item) {
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
}

function registerUser (data, response, callback) {
	var collection = db.collection('users');
	collection.insert(data, {w: 1, unique: true}, function (err, result) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err);
		}
		else {
			( callback ) && callback();
		}		
	});
}

function setUserToken (data, response, callback) {
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
}

function userLogin (user, response, callback) {
	var email = user.email,
		password = user.password,
		cryptoPass = crypto.createHash('md5').update(password).digest('hex');
		collection = db.collection('users');

	collection.findOne({email: email}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err);		
		}
		else {
			if ( item && item.password === cryptoPass ) {
				setUserToken(item, response, callback);
			}
			else {
				responseActions.sendResponse(response, 403);
			}
		}			
	});
}

function checkToken (data, response, callback) {
	compareToken(data, response, callback);
}

function compareToken (data, response, callback) {
	var collection = db.collection('users');
	collection.findOne({email: data.email}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err);
		}
		else {
			if ( item.token == data.token ) {
				setUserToken(item, response, callback);
			}
			else {
				responseActions.sendResponse(response, 401);
			}
		}
	});
}

function checkExistingEmail (data, response) {
	if ( data.email ) {
		checkEmail(data.email, response, function () {
			responseActions.sendResponse(response, 200);
		});
	}
}

function checkExistingNickname (data, response) {
	if ( data.nickname ) {
		checkNickname(data.nickname, response, function () {
			responseActions.sendResponse(response, 200);
		});
	}
}

function getAllTalks (data, response) {
	data.page_size = Number(data.page_size);
	data.page = Number(data.page);
	var perPage = ( data.page_size < 1 || !data.page_size ) ? 10 : Number(data.page_size),
		page = ( data.page < 1 || !data.page ) ? 1 : data.page,
		collection = db.collection('talks'),
		result = [];

	collection.find({}).sort({date: -1}).skip(perPage * (page - 1)).limit(perPage + 1).toArray(function (err, items) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			var len = items.length,
				isEnd = true;
			if ( items.length == perPage + 1 ) {
				len--;
				isEnd = false;
			}
			for ( var i = 0; i < len; i++ ) {
				result.push({
					id: items[i]._id,
					title: items[i].title,
					date: items[i].date,
					image: items[i].path + items[i]._id + items[i].extension
				});
			}
			responseActions.sendResponse(response, 200, {talks: result, isEnd: isEnd});
		}
	});
}

function getUser (data, response) {
	var collection = db.collection('users'),
		fields = ['firstName', 'lastName', 'nickname', 'city', 'about', 'job', 'talks'];
	collection.findOne({nickname: data.nickname}, fields, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			var talksCollection = db.collection('talks'),
				talkFields = ['title'],
				idTalks = item.talks || [];
			idTalks.reverse();
			item.talksNumber = idTalks.length;
			talksCollection.find({'_id': { $in: idTalks.slice(0, 10)}}, talkFields).toArray(function(err, docs){
			    if ( err ) {
					responseActions.sendDataBaseError(response, err, db);
				}
				else {
					item.talks = docs || [];
					responseActions.sendResponse(response, 200, item);
				}
			});
		}
	});
}

function changeAccount (data, response) {
	var collection = db.collection('users'),
		newData = {
			password: data.password,
			city: (data.city) ? data.city : '',
			firstName: (data.firstName) ? data.firstName : '',
			lastName: (data.lastName) ? data.lastName : '',
			about: (data.about) ? data.about : '',
			job: (data.job) ? data.job : ''
		};
	collection.findAndModify({_id: data.id}, [['email', 1]], {$set: newData}, {}, function (err, object) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err);
		}
		else {
			responseActions.sendResponse(response, 200);
		}
	});
}

function handleDbError(err, item, callback) {
	if ( err ) {
		responseActions.sendDataBaseError(response, err);
	}
	else {
		( callback ) && callback(item);
	}
}

var commentsCtrl = (function () {
	return {
		addComment: function(data, user, response) {
			var comment = {
				userId: user._id,
				talkId: data.talkId,
				text: data.text,
				rating: 0,
				evaluators: []
			};

			collections.comments.insert(comment, {w: 1, unique: true}, function (err, result) {
				handleDbError(err, result, function (result) {
					responseActions.sendResponse(response, 200);
				});
			});
		},
		getComments: function (data, response) {
			var page = parseInt(data.page) || 1,
				pageSize = parseInt(data.page_size) || 10;
		},
		evaluate: function (data, user, response) {
			
		}
	};
})();

var talksCtrl = (function () {
	return {
		addTalk: function(talk, user, response, callback) {
			var now = new Date(),
				date = new Date(talk.date);

			talk = {
				participants: [],
				numberOfParticipants: 0,
				participants: [],
				evaluators: [],
				comments: [],
				rating: 0,
				author: user._id,
				created: now.getTime() + 60 * 1000 * now.getTimezoneOffset(),
				lastModified: now.getTime() + 60 * 1000 * now.getTimezoneOffset(),
				date: date.getTime() + 60 * 1000 * date.getTimezoneOffset()
			};

			if ( talk.date != talk.date ) {
				responseActions.sendResponse(response, 403, {field: 'date', message: responseActions.errors.date});
				return;
			}

			collections.talks.insert(talk, {w: 1, unique: true}, function (err, result) {
				handleDbError(err, result, function (result) {

					collections.users.findOne({email: user.email}, function (err, item) {
						handleDbError(err, item, function (item) {
							item.talks.push(result[0]._id);
							collection.update({email: user.email}, {$set: {talks: item.talks}});
							( callback ) ? callback(result[0]._id) : responseActions.sendResponse(response, 200, result[0]._id);
						});	
					});	
				});
			});
		},
		getTalk: function(data, response) {
			var fields = ['title', 'description', 'path', 'extension', 'date', 'author', 'numberOfParticipants', 'comments', 'rating', 'participants', 'evaluators'],
				o_id = new BSON.ObjectID(data.id);

			collections.talks.findOne({_id: o_id}, fields, function (err, item) {
				handleDbError(err, item, function (item) {
					if ( item ) {
						item.image = item.path + item._id + item.extension;		
					}
					var userId = new BSON.ObjectID(item.author),
						userFields = ['nickname'];

					collections.users.findOne({_id: userId}, userFields, function (err, user) {
						handleDbError(err, user, function (user) {
							item.author = user;
							if ( item.participants.indexOf(user._id) + 1 ) {
								item.participants = [];
							}
							responseActions.sendResponse(response, 200, item);
						});
					});					
				});				
			});
		},
		subscribe: function (data, user, response) {
			var talk_id = new BSON.ObjectID(data.id);
			//update talks collection
			collections.talks.findOne({_id: talk_id}, function (err, item) {
				handleDbError(err, item, function (item) {
					item.participants.push(user._id);
					item.numberOfParticipants++;

					collections.talks.update({_id: talk_id}, {$set: {
							participants: item.participants, 
							numberOfParticipants: item.numberOfParticipants
						}}, function (err, result) {
						//if update of the talk was successful
						handleDbError(err, result, function (result) {
							//update users collection
							collections.users.findOne({_id: talk_id}, function (err, user) {
								handleDbError(err, user, function (user) {
									user.talks.push(result[0]._id);

									collections.users.update({email: user.email}, {$set: {talks: user.talks}}, function (err) {
										//if update of the user was successful
										handleDbError(err, null, function () {
											responseActions.sendResponse(response, 200);
										});
									});
								});
							});
						});
					});
				});
			});
		},
		evaluate: function (data, user, response) {

		}
	};
})();

exports.setDB = setDB;
exports.insertUser = insertUser;
exports.userLogin = userLogin;
exports.checkEmail = checkExistingEmail;
exports.checkNickname = checkExistingNickname;
exports.checkToken = checkToken;
exports.setUserToken = setUserToken;
exports.getAllTalks = getAllTalks;
exports.getUser = getUser;
exports.changeAccount = changeAccount;
exports.talksCtrl = talksCtrl;
exports.commentsCtrl = commentsCtrl;