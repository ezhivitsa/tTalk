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
		}
	}
}]);
app.sessionVerification = function($q, $http, $location) {
	var defer = $q.defer();
	// $http
	// $location.path("/main");
	defer.resolve();
	return defer.promise;
};

// app.userLogin = function($q, $http, $location, $timeout, $log, ) {
// 	console.log(email, password, $q, $http, $location, $timeout, $log)
// 	// var defer = $q.defer();
// 	// // $http
// 	// // $location.path("/main");
// 	// $timeout(function(){
// 	// 	$log(email, password, $q, $http, $location, $timeout, $log);
// 	// 	defer.resolve();
// 	// }, 1000);
// 	// return defer.promise;
// };