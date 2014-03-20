var GoogleTokenProvider = require("refresh-token").GoogleTokenProvider,
    async = require('async'),
    request = require('request'),
    _accessToken;


const CLIENT_ID = "216940919489-8mi409l6gacjgfknj5c2v5n3jfo29g9a.apps.googleusercontent.com";
const CLIENT_SECRET = "aJA1P5YHIJneugDDXbghjg9V";
const REFRESH_TOKEN = "1/E73r5PGX8-inCAoZjRNRtRHXMSQD_LtwU5erVLe0D1ss";
const ENDPOINT_OF_GDRIVE = 'https://www.googleapis.com/drive/v2';
const FOLDER_ID = '0Bwl9paG4iXtCRlBrcTJva2xNa0k';

async.waterfall([
  //-----------------------------
  // Obtain a new access token
  //-----------------------------
  function(callback) {
    var tokenProvider = new GoogleTokenProvider({
      'refresh_token': REFRESH_TOKEN,
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    });
    tokenProvider.getToken(callback);
  },

  //--------------------------------------------
  // Retrieve the children in a specified folder
  // 
  // ref: https://developers.google.com/drive/v2/reference/files/children/list
  //-------------------------------------------
  function(accessToken, callback) {
    _accessToken = accessToken;
    request.get({
      'url': ENDPOINT_OF_GDRIVE + '/files/' + FOLDER_ID + '/children',
      'qs': {
        'access_token': accessToken
      }
    }, callback);
  },

  //----------------------------
  // Parse the response
  //----------------------------
  function(response, body, callback) {
    var list = JSON.parse(body);
    if (list.error) {
      return callback(list.error);
    }
    callback(null, list.items);
  },

  //-------------------------------------------
  // Get the file information of the children.
  //
  // ref: https://developers.google.com/drive/v2/reference/files/get
  //-------------------------------------------
  function(children, callback) {
    async.map(children, function(child, cback) {
      request.get({
        'url': ENDPOINT_OF_GDRIVE + '/files/' + child.id,
        'qs': {
          'access_token': _accessToken
        }
      }, function(err, response, body) {
        body = JSON.parse(body);
        cback(null, {
          'title': body.title,
          'md5Checksum': body.md5Checksum
        });
      });
    }, callback);
  }
], function(err, results) {
  if (!err) {
    console.log(results);
  }
});


request.get({
        'url': ENDPOINT_OF_GDRIVE + '/files/' + child.id,
        'qs': {
          'access_token': _accessToken
        }
      }, 
      function(err, response, body) {
        body = JSON.parse(body);
        cback(null, {
          'title': body.title,
          'md5Checksum': body.md5Checksum
        });
      });