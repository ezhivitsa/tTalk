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
		data: 'Not all data'
	}
	


function insertUser(userData, request) {
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

		db.open(function(err, db) {
			var collection = db.collection('users');
			collection.findOne({email: email}, function (err, item) {
				assert.equal(null, err);
				if ( !item ) {
					collection.findOne({nickname: nickname}, function (err, nickItem) {
						assert.equal(null, err);
						if ( !nickItem ) {
							collection.insert(data, {w: 1, unique: true}, function (err, result) {
								assert.equal(null, err);
								// Message: user added
								response.writeHead(200, {'Content-Type': 'application/json'});
								response.end();
								db.close();
							});
						}
						else {
							// Message: this nickname already exist
							response.writeHead(501, {'Content-Type': 'application/json'});
    						response.end(JSON.stringify({nickname: errors.nicknameExist}));
							db.close();
						}
					});
				}
				else {
					// Message: this email already exist
					response.writeHead(501, {'Content-Type': 'application/json'});
    				response.end(JSON.stringify({email: errors.emailExist}));
					db.close();
				}
			});
		});
	}
	else {
		// Message: not all data
		response.writeHead(501, {'Content-Type': 'application/json'});
    	response.end(JSON.stringify({email: errors.data}));
	}
}

function userLogin (user, response) {
	var email = user.email,
		password = user.password;		

	if ( email && password ) {
		var cryptoPass = crypto.createHash('md5').update(password).digest('hex');

		db.open(function (err, db) {
			assert.equal(err, null);
			var collection = db.collection('users');
			collection.findOne({email: email}, function (err, item) {
				assert.equal(err, null);
				if ( item && item.password === cryptoPass ) {
					response.writeHead(200, {'Content-Type': 'application/json'});
					response.end();
				}
				else {
					response.writeHead(501, {'Content-Type': 'application/json'});
					response.end();
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

exports.insertUser = insertUser;
exports.userLogin = userLogin;