var GoogleTokenProvider = require("refresh-token").GoogleTokenProvider;

const CLIENT_ID = "216940919489-8mi409l6gacjgfknj5c2v5n3jfo29g9a.apps.googleusercontent.com";
const CLIENT_SECRET = "aJA1P5YHIJneugDDXbghjg9V";
const REFRESH_TOKEN = "1/E73r5PGX8-inCAoZjRNRtRHXMSQD_LtwU5erVLe0D1ss";


var tokenProvider = new GoogleTokenProvider({
  'refresh_token': REFRESH_TOKEN,
  'client_id' : CLIENT_ID,
  'client_secret': CLIENT_SECRET
});

tokenProvider.getToken(function(err, access_token) {
  console.log("Access Token=", token);
});