var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	ReplSetServers = require('mongodb').ReplSetServers,
	ObjectID = require('mongodb').ObjectID,
	Binary = require('mongodb').Binary,
	GridStore = require('mongodb').GridStore,
	Grid = require('mongodb').Grid,
	Code = require('mongodb').Code,
	BSON = require('mongodb').pure().BSON,
	assert = require('assert'),
	crypto = require('crypto');

var DB = new Db('ttalk', new Server('ds063307.mongolab.com', 63307));

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
			nickname: nickname
		};

	if ( firstName ) {
		data.firstName = firstName;
	}
	if ( lastName ) {
		data.lastName = lastName;
	}

	openConnection(response, function (db) {
		checkEmail(db, email, response, function (db) {
			checkNickname(db, nickname, response, function (db) {
				registerUser(db, data, response, function (db) {
					setUserToken(db, data, response, callback);
				});
			});
		});
	});
}

function openConnection (response, callback) {
	DB.open(function (err, db) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			DB.authenticate('ttalk', 'ttalk123', function(err, p_client) { 
				if ( err ) {
					responseActions.sendDataBaseError(response, err, db);
				}
				else {
                	( callback ) ? callback(db) : db.close();					
				}
        	});			
		}
	});
}

function checkEmail (db, email, response, callback) {
	var expr = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	if ( expr.test(email) && email.length >= 6 && email.length <= 20 ) {
		var collection = db.collection('users');
		collection.findOne({email: email}, function (err, item) {
			if ( err ) {
				responseActions.sendDataBaseError(response, err, db);
			}
			else {
				if ( item ) {
					responseActions.sendResponse(response, 403, {field: 'email', message: responseActions.errors.emailExist}, db);
				}
				else {
					( callback ) ? callback(db) : db.close();
				}
			}
		});
	}
	else {
		responseActions.sendResponse(response, 403, {field: 'email', message: responseActions.errors.invalidEmail}, db);
	}
}

function checkNickname (db, nickname, response, callback) {
	var collection = db.collection('users');
	collection.findOne({nickname: nickname}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			if ( item ) {
				responseActions.sendResponse(response, 403, {field: 'nickname', message: responseActions.errors.nicknameExist}, db);
			}
			else {
				( callback ) ? callback(db) : db.close();
			}
		}
	});
}

function registerUser (db, data, response, callback) {
	var collection = db.collection('users');
	collection.insert(data, {w: 1, unique: true}, function (err, result) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			( callback ) ? callback(db) : db.close();
		}		
	});
}

function userLogin (user, response, callback) {
	var email = user.email,
		password = user.password,
		cryptoPass = crypto.createHash('md5').update(password).digest('hex');

	openConnection(response, function (db) {
		var collection = db.collection('users');
		collection.findOne({email: email}, function (err, item) {
			if ( err ) {
				responseActions.sendDataBaseError(response, err, db);		
			}
			else {
				if ( item && item.password === cryptoPass ) {
					setUserToken(db, item, response, callback);
				}
				else {
					responseActions.sendResponse(response, 403, {}, db);
				}
			}			
		});
	});
}

function setUserToken (db, data, response, callback) {
	crypto.randomBytes(48, function(ex, buf) {
		var token = buf.toString('hex'),
			collection = db.collection('users');

		collection.findAndModify({email: data.email}, [['email', 1]], {$set: {token: token}}, {}, function (err, object) {
			if ( err ) {
				responseActions.sendDataBaseError(response, err, db);
			}
			else {
				responseActions.sendResponse(response, 200, {
					nickname: data.nickname,
					firstName: data.firstName,
					lastName: data.lastName
				}, db);
				( callback ) && callback(token);
			}
		});		
	});
}

function checkToken (data, response, callback) {
	openConnection(response, function (db) {
		compareToken(db, data, response, callback);
	});
}

function compareToken (db, data, response, callback) {
	var collection = db.collection('users');
	collection.findOne({email: data.email}, function (err, item) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			if ( item.token == data.token ) {
				setUserToken(db, item, response, callback);
			}
			else {
				responseActions.sendResponse(response, 401, {}, db);
			}
		}
	});
}



function addTalk (talk, response) {
	var title = talk.title;

	// db - talks
}

function checkExistingEmail (data, response) {
	if ( data.email ) {
		openConnection(response, function (db) {
			checkEmail(db, data.email, response, function (db) {
				responseActions.sendResponse(response, 200, {}, db);
			});
		});
	}
}

function checkExistingNickname (data, response) {
	if ( data.nickname ) {
		openConnection(response, function (db) {
			checkNickname(db, data.nickname, response, function (db) {
				responseActions.sendResponse(response, 200, {}, db);
			});
		});
	}
}

exports.insertUser = insertUser;
exports.userLogin = userLogin;
exports.checkEmail = checkExistingEmail;
exports.checkNickname = checkExistingNickname;
exports.checkToken = checkToken;
exports.addTalk = addTalk;
exports.setUserToken = setUserToken;