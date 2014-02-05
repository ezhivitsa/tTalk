app.controller('LoginCtrl',function($scope,HttpService) {
	$scope.login = function() {
		HttpService.userLogin($scope.email,$scope.password);
		// console.log($scope, $q, $http, $location);
	};
	$scope.register = function() {
		HttpService.userRegistrate({
			email: $scope.email,
			password: $scope.password,
			mickname: $scope.nickname,
			firstname: $scope.firstName,
			lastName: $scope.lastName
		});
	};
})