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

var db = new Db('ttalk', new Server('127.0.0.1', 27017)),
	errors  = {
		nicknameExist: 'This nickname is already in use',
		emailExist: 'This email is already in use',
		data: 'Not all data',
		dbErrod: 'Database error',
		invalidEmail: 'Invalid email'
	};
	


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
					// setUserToken(db, data, response, function (db, token) {
					// 	response.writeHead(200, {'Content-Type': 'application/json'});
					// 	response.end(JSON.stringify({
					// 		nickname: nickname,
					// 		firstName: firstName,
					// 		lastName: lastName
					// 	}));
					// 	db.close();
					// 	( callback ) && callback(token);
					// });
				});
			});
		});
	});
}

function openConnection (response, callback) {
	db.open(function (err, db) {
		if ( err ) {
			console.warn(err.message);
			response.writeHead(500, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({error: dbErrod}));
			db.close();
		}
		else {
			( callback ) ? callback(db) : db.close();
		}
	});
}

function checkEmail (db, email, response, callback) {
	var expr = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	if ( expr.test(email) && email.length >= 6 && email.length <= 20 ) {
		var collection = db.collection('users');
		collection.findOne({email: email}, function (err, item) {
			if ( err ) {
				console.warn(err.message);
				response.writeHead(500, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({error: dbErrod}));
				db.close();
			}
			else {
				if ( item ) {
					response.writeHead(403, {'Content-Type': 'application/json'});
		   			response.end(JSON.stringify({field: 'email', message: errors.emailExist}));
			 		db.close();
				}
				else {
					( callback ) ? callback(db) : db.close();
				}
			}
		});
	}
	else {
		response.writeHead(403, {'Content-Type': 'application/json'});
		response.end(JSON.stringify({field: 'email', message: errors.invalidEmail}));
 		db.close();
	}
}

function checkNickname (db, nickname, response, callback) {
	var collection = db.collection('users');
	collection.findOne({nickname: nickname}, function (err, item) {
		if ( err ) {
			console.warn(err.message);
			response.writeHead(500, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({error: dbErrod}));
			db.close();
		}
		else {
			if ( item ) {
				response.writeHead(403, {'Content-Type': 'application/json'});
	   			response.end(JSON.stringify({field: 'nickname', message: errors.nicknameExist}));
		 		db.close();
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
			console.warn(err.message);
			response.writeHead(500, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({error: dbErrod}));
			db.close();
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
				console.warn(err.message);
				response.writeHead(500, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({error: dbErrod}));			
			}
			else {
				if ( item && item.password === cryptoPass ) {
					setUserToken(db, item, response, callback);
					// setUserToken(db, item, response, function (db, token) {
					// 	response.writeHead(200, {'Content-Type': 'application/json'});
					// 	response.end(JSON.stringify({
					// 		nickname: item.nickname,
					// 		firstName: item.firstName,
					// 		lastName: item.lastName
					// 	}));
					// 	db.close();
					// 	( callback ) && callback(token);
					// });
				}
				else {
					response.writeHead(403, {'Content-Type': 'application/json'});
					response.end();
					db.close();
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
				console.warn(err.message);
				response.writeHead(500, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({error: dbErrod}));
				db.close()		
			}
			else {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({
					nickname: data.nickname,
					firstName: data.firstName,
					lastName: data.lastName
				}));
				db.close();
				( callback ) && callback(token);
				//( callback ) ? callback(db, token) : db.close();
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
			console.warn(err.message);
			response.writeHead(500, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({error: dbErrod}));
			db.close();
		}
		else {
			if ( item.token == data.token ) {
				setUserToken(db, item, response, callback);
				// setUserToken(db, item, response, function (db, token) {
				// 	response.writeHead(200, {'Content-Type': 'application/json'});
				// 	response.end(JSON.stringify({
				// 		nickname: item.nickname,
				// 		firstName: item.firstName,
				// 		lastName: item.lastName
				// 	}));
				// 	db.close();
				// 	( callback ) && callback(token);
				// });
			}
			else {
				response.writeHead(401, {'Content-Type': 'application/json'});
				response.end();
				db.close();
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
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end();
				db.close();
			});
		});
	}
}

function checkExistingNickname (data, response) {
	if ( data.nickname ) {
		openConnection(response, function (db) {
			checkNickname(db, data.nickname, response, function (db) {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end();
				db.close();
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