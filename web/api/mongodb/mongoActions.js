var mongodb = require('./mongodb.js'),
	crypto = require('crypto'),
	responseActions = require('../responseActions.js');

function setDB(dataBase) {
	db = dataBase;
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
			talks: []
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

function addTalk (talk, user, response, callback) {
	var talksCollection = db.collection('talks'),
		usersCollection = db.collection('users'),
		now = new Date(),
		date = new Date(talk.date);

	talk.participants = [];
	talk.author = user._id;
	talk.created = now.getTime() + 60 * 1000 * now.getTimezoneOffset();
	talk.lastModified = now.getTime() + 60 * 1000 * now.getTimezoneOffset();
	talk.date = date.getTime() + 60 * 1000 * date.getTimezoneOffset();

	if ( this.date != this.date ) {
		responseActions.sendResponse(response, 403, {field: 'date', message: responseActions.errors.date});
		return;
	}

	talksCollection.insert(talk, {w: 1, unique: true}, function (err, result) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			usersCollection.findOne({email: user.email}, function (err, item) {
				if ( err ) {
					responseActions.sendDataBaseError(response, err);
				}
				else {
					item.talks.push(result[0]._id);
					collection.update({email: user.email}, {$set: {talks: item.talks}});
					( callback ) ? callback(result[0]._id) : responseActions.sendResponse(response, 200, result[0]._id);
				}
			});
		}		
	});
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

function getTalk (data, response) {
	var collection = db.collection('talks');
	collection.findOne({_id: data.id}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			item.image = items[i].path + items[i]._id + items[i].extension;
			responseActions.sendResponse(response, 200, item);
		}
	});
}

function getUser (data, response) {
	var collection = db.collection('users');
	collection.findOne({_id: data.id}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			responseActions.sendResponse(response, 200, item);
		}
	});
}

function changeAccount (data, response) {
	var collection = db.collection('users'),
		newData = {
			password: data.password,
			city: (data.city) ? data.city : '',
			firstName: (data.firstName) ? data.firstName : '',
			lastName: (data.firstName) ? data.lastName : '',
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

exports.setDB = setDB;
exports.insertUser = insertUser;
exports.userLogin = userLogin;
exports.checkEmail = checkExistingEmail;
exports.checkNickname = checkExistingNickname;
exports.checkToken = checkToken;
exports.addTalk = addTalk;
exports.setUserToken = setUserToken;
exports.getAllTalks = getAllTalks;
exports.getUser = getUser;
exports.changeAccount = changeAccount;