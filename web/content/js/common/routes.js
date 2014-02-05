app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/login.html',
			controller: 'LoginCtrl',
			resolve: {
				sessionVerification: app.sessionVerification
			}
		}).when('/registration', {
			templateUrl: 'templates/registration.html',
			controller: 'LoginCtrl',
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
		}).otherwise({ 
			redirectTo: '/main'
		});
});