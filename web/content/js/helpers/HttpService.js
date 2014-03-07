app.factory('HttpService', ['$q','$http','$location','$timeout',function($q, $http, $location, $timeout) {
	return {

		userLogin: function( myScope, logData ) {
			var defer = $q.defer();
			$http({
				method: 'POST', 
				url: '../api/login',
				data: logData
			}).success(function(data, status, headers, config) {				
				defer.resolve();				
				$location.path("/main");
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					myScope.incorect = true;
					defer.resolve();
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}
			});
			return defer.promise;
		},

		checkField: function( myScope, filedVal, checkUrl, fieldName ) {
			var defer = $q.defer(),
				val = {};
			val[fieldName] = filedVal;
			$http({
				method: 'POST', 
				url: checkUrl,
				data: val
			}).success(function(data, status, headers, config) {
				myScope[fieldName + 'ErrorVis'] = false;				
				defer.resolve();
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					myScope[fieldName + 'ErrorVis'] = true;
					myScope[fieldName + 'Error'] = data.message;
					defer.resolve();
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}				
			});
			return defer.promise;
		},

		userRegistrate: function( myScope, regData ) {
			console.log(regData)
			var defer = $q.defer();
			$http({
				method: 'POST', 
				url: '../api/registration',
				data: {
					'email': regData.email,
					'password': regData.password,
					'nickname': regData.nickname,
					'firstname': regData.firstName,
					'lastname': regData.lastName
				}
			}).success(function(data, status, headers, config) {				
				defer.resolve();
				$location.path("/main");
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					switch(data.field) {
						case "email":
							myScope.emailErrorVis = true;
							myScope.emailError = data.message;
							defer.resolve();
							break;
						case "password":
							myScope.passwordErrorVis = true;
							myScope.passwordError = data.message;
							defer.resolve();
							break;
						case "nickname":
							myScope.nicknameErrorVis = true;
							myScope.nicknameError = data.message;
							defer.resolve();
							break;
						case "data":
							defer.reject({
								message : data.message,
								status: status
							});	
							break;
						default:
							defer.reject({
								message : data.message,
								status: status
							});	
					}
				}				
			});
			return defer.promise;
		}
	}
}]);

app.sessionVerification = function($q, $http, $location) {
	var defer = $q.defer();
	$http({
		method: 'GET', 
		url: 'api/checklogin',
	}).success(function(data, status, headers, config) {
		if ($location.$$path == "/" || $location.$$path == "/registration") {
			$location.path("/main");
		}				
		defer.resolve();
	}).error(function(data, status, headers, config) {
		if (status == "401") {
			if ($location.$$path != "/" && $location.$$path != "/registration") {
				$location.path("/");
			}
			defer.resolve();
		} else {
			defer.reject({
				message : "data.message",
				status: status
			});
		}			
	});
	return defer.promise;
};

app.loadTalks = function($q, $http, $location) {
	var defer = $q.defer();
	// $http
	// $location.path("/main");
	defer.resolve();
	return defer.promise;
}