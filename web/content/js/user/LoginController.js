app.controller('LoginCtrl',function($scope,HttpService) {
	$scope.login = function() {
		HttpService.userLogin($scope.email,$scope.password);
		// console.log($scope, $q, $http, $location);
;	};
})