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
		dbErrod: 'Database error'
	}
	


function insertUser(userData, response) {
	var email = userData.email,
		password = userData.password,
		nickname = userData.nickname,
		firstname = userData.firstname,
		lastname = userData.lastname;

	if ( email && password && nickname ) {
		var cryptoPass = crypto.createHash('md5').update(password).digest('hex'),
			data = {
				email: email,
				password: cryptoPass,
				nickname: nickname
			};

		if ( firstname ) {
			data.firstname = firstname;
		}
		if ( lastname ) {
			data.lastname = lastname;
		}

		openConnection(response, function (db) {
			checkEmail(db, email, response, function (db) {
				checkNickname(db, nickname, response, function (db) {
					registerUser(db, data, response);
				});
			});
		});
	}
	else {
		response.writeHead(501, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({field: 'data', message: errors.data}));
	}
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
			( callback ) && callback(db);
		}
	});
}

function checkEmail (db, email, response, callback) {
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
				response.writeHead(501, {'Content-Type': 'application/json'});
	   			response.end(JSON.stringify({field: 'email', message: errors.emailExist}));
		 		db.close();
			}
			else {
				( callback ) && callback(db);
			}
		}
	});
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
				response.writeHead(501, {'Content-Type': 'application/json'});
	   			response.end(JSON.stringify({field: 'nickname', message: errors.nicknameExist}));
		 		db.close();
			}
			else {
				( callback ) && callback(db);
			}
		}
	});
}

function registerUser (db, data, response) {
	var collection = db.collection('users');
	collection.insert(data, {w: 1, unique: true}, function (err, result) {
		if ( err ) {
			console.warn(err.message);
			response.writeHead(500, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({error: dbErrod}));			
		}
		else {
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end();
		}
		db.close();
	});
}

function userLogin (user, response) {
	var email = user.email,
		password = user.password;		

	if ( email && password ) {
		var cryptoPass = crypto.createHash('md5').update(password).digest('hex');

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
						response.writeHead(200, {'Content-Type': 'application/json'});
						response.end();
					}
					else {
						response.writeHead(501, {'Content-Type': 'application/json'});
						response.end();
					}
				}
				db.close();
			});
		});
	}
	else {
		response.writeHead(501, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({email: errors.data}));
	}
}

function setUserToken (user, callback) {
	crypto.randomBytes(48, function(ex, buf) {
		var token = buf.toString('hex');
		db.open(function (err, db) {
			assert.equal(err, null);
			var collection = db.collection('users');
			collection.findAndModify({email: user.email}, ['email'], {$set: {token: token}}, {}, function(err, object) {
				if ( err ) {
					console.warn(err.message);
				}
				else {
					console.dir(object);
				}
			});
		});
		if ( callback ) {
			callback();
		}
	});
}

function verifyUserToken (user, request) {

}

function addTalk (talk, response) {
	var title = talk.title;

	// db - talks
}

exports.insertUser = insertUser;
exports.userLogin = userLogin;
exports.addTalk = addTalk;
exports.setUserToken = setUserToken;
exports.verifyUserToken = verifyUserToken;