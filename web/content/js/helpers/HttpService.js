app.factory('HttpService', ['$q', '$http', '$location', '$timeout', '$rootScope', function($q, $http, $location, $timeout, $rootScope) {
	return {

		userLogin: function( myScope ) {
			var defer = $q.defer();
			$http({
				method: 'POST', 
				url: '../api/login',
				data:  myScope.logData
			}).success(function(data, status, headers, config) {	
				localStorage.setItem("nickname", data.nickname);
				localStorage.setItem("full", data.firstName + " " + data.lastName);
				$rootScope.$broadcast('logged');
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

		userLogout: function() {
			var defer = $q.defer();
			$http({
				method: 'GET', 
				url: '../api/logout'
			}).success(function(data, status, headers, config) {
				
				$rootScope.$broadcast('unlogged');
				defer.resolve();				
				$location.path("/");
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					$rootScope.$broadcast('unlogged');
					defer.resolve();
					$location.path("/");
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

		userRegistrate: function( myScope ) {
			var defer = $q.defer();
			$http({
				method: 'POST', 
				url: '../api/registration',
				data: myScope.regData
			}).success(function(data, status, headers, config) {
				localStorage.setItem("nickname", data.nickname);				
				localStorage.setItem("full", data.firstName + " " + data.lastName);
				$rootScope.$broadcast('logged');				
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
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}				
			});
			return defer.promise;
		},

		createTalk: function( myScope ) {
			var defer = $q.defer();
			$http({
				method: 'POST', 
				url: '../api/createtalk',
				data: {
					title: myScope.talk.title,
					description: myScope.talk.description,
					date: (new Date(myScope.talk.date)).toUTCString()
				}
			}).success(function(data, status, headers, config) {				
				defer.resolve();
				$location.path("/talk/" + data.talkId);
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					$rootScope.$broadcast('unlogged');
					defer.resolve();
					$location.path("/");
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}
			});
		},

		file: function( form ) {
			var defer = $q.defer();
			console.log(form);
			$http({
				method: 'POST', 
				url: '../api/image',
				data: form
			}).success(function(data, status, headers, config) {				
				defer.resolve();
				alert('good');
			}).error(function(data, status, headers, config) {
				if (status == "403") {
					$rootScope.$broadcast('unlogged');
					defer.resolve();
					$location.path("/");
				} else {
					defer.reject({
						message : data.message,
						status: status
					});	
				}
			});
		}
	}
}]);

app.sessionVerification = function( $q, $http, $location, $rootScope ) {
	var defer = $q.defer();
	$http({
		method: 'GET', 
		url: 'api/checklogin',
	}).success(function(data, status, headers, config) {
		if ($location.$$path == "/" || $location.$$path == "/registration") {
			$location.path("/main");
		}				
		$rootScope.$broadcast('logged');
		defer.resolve();
	}).error(function(data, status, headers, config) {
		if (status == "401") {
			if ($location.$$path != "/" && $location.$$path != "/registration") {
				$location.path("/");
			}				
			$rootScope.$broadcast('unlogged');
			defer.resolve();
		} else {
			defer.reject({
				message : data,
				status: status
			});
		}			
	});
	return defer.promise;
};

app.loadTalks = function( $q, $http, $location, $rootScope ) {
	var defer = $q.defer();
	$http({
		method: 'GET', 
		url: '/api/talks',
	}).success(function(data, status, headers, config) {			
		$rootScope.$broadcast('logged');
		$rootScope.talks = data.talks;
		defer.resolve();
	}).error(function(data, status, headers, config) {
		if (status == "401") {
			if ($location.$$path != "/" && $location.$$path != "/registration") {
				$location.path("/");
			}				
			$rootScope.$broadcast('unlogged');
			defer.resolve();
		} else {
			defer.reject({
				message : data,
				status: status
			});
		}			
	});
	defer.resolve();
	return defer.promise;
}