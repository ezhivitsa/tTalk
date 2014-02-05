// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
function createConnection (host, port, dbName) {
	MongoClient.connect('mongodb://127.0.0.1:27017/ttalk', function(err, db) {
		if( err ) { 
			return console.dir(err);
		}
		
		db.collection('users', function(err, collection) {
			if( err ) {
				return console.dir(err);
			}
			console.log('We are connected to the table users')
		});

	});
}

exports.createConnection = createConnection;