app.factory('HttpService', ['$q','$http','$location','$timeout',function($q, $http, $location, $timeout) {
	return {
		userLogin: function(email, password) {
			var defer = $q.defer();
			$timeout(function(){
				// $http				
				console.log(email, password);
				$location.path("/main");
			}, 1000);
			defer.resolve();
			return defer.promise;
		},
		userRegistrate: function(regData) {
			var defer = $q.defer();
			$timeout(function(){
				// $http				
				console.log(regData);
				$location.path("/main");
			}, 1000);
			defer.resolve();
			return defer.promise;
		}
	}
}]);
app.sessionVerification = function($q, $http, $location) {
	var defer = $q.defer();
	// $http
	// $location.path("/main");
	defer.resolve("Session anabled");
	// defer.reject("Session verification error");
	return defer.promise;
};
app.loadTalks = function($q, $http, $location) {
	var defer = $q.defer();
	// $http
	// $location.path("/main");
	defer.resolve();
	return defer.promise;
}