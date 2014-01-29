// app.factory('Http', function() {
// 	return {
// 		sessionVerification: function(path, $http) {
// 			// console.log($http);
// 			//Здесь должна быть проверка сессии
// 			return path;
// 		}
// 	}
// });
app.sessionVerification = function($q, $http, $location) {
	var defer = $q.defer();
	// $http
	// $location.path("/main");
	defer.resolve();
	return defer.promise;
};