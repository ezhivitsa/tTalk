var app = angular.module('tTalk', ['ngRoute','angularFileUpload','ngResource'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl',
				resolve: {
					sessionVerification: app.sessionVerification
				}
			}).when('/registration', {
				templateUrl: 'templates/registration.html',
				controller: 'RegisterCtrl',
				resolve: {
					sessionVerification: app.sessionVerification
				}
			}).when('/main', {
				templateUrl: 'templates/main.html',
				controller: 'MainCtrl',
				resolve: {
					sessionVerification: app.sessionVerification
				}
			}).when('/error', {
				templateUrl: 'templates/error.html',
				controller: 'EventCtrl'
			}).when('/createTalk', {
				templateUrl: 'templates/createTalk.html',
				controller: 'CreateTalkCtrl',
				resolve: {
					sessionVerification: app.sessionVerification
				}
			}).when('/talk/:id', {
				templateUrl: 'templates/talk.html',
				controller: 'TalkCtrl',
				resolve: {
					sessionVerification: app.sessionVerification
				}
			}).otherwise({ 
				redirectTo: '/main'
			});
	});

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