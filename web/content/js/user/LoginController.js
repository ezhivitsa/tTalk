app.controller('LoginCtrl',function($scope,HttpService) {
	$scope.incorect = false;
	$scope.login = function() {
		HttpService.userLogin($scope,$scope.logData);
	};
})