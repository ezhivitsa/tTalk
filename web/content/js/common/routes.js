app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/login.html',
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
		}).otherwise({ 
			redirectTo: '/main'
		});
});