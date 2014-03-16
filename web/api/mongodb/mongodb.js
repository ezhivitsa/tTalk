var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	ObjectID = require('mongodb').ObjectID,
	mongoActions = require('./mongoActions.js');
	

var DB = new Db('ttalk', new Server('ds063307.mongolab.com', 63307));

function openConnection (response, callback) {
	DB.open(function (err, dataBase) {
		if ( err ) {
			responseActions.sendDataBaseError(response, err, db);
		}
		else {
			DB.authenticate('ttalk', 'ttalk123', function(err, p_client) { 
				if ( err ) {
					responseActions.sendDataBaseError(response, err, db);
				}
				else {
                	mongoActions.setDB(dataBase);
				}
        	});			
		}
	});
}

exports.openConnection = openConnection;