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
			controller: 'RegisterCtrl',
			resolve: {
				sessionVerification: app.sessionVerification
			}
		}).when('/main', {
			templateUrl: 'templates/main.html',
			controller: 'MainCtrl',
			resolve: {
				sessionVerification: app.loadTalks
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