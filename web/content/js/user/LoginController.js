app.controller('LoginCtrl',function($scope,$timeout,HttpService) {
	var self = this;
	self.emailPromise = null;
	$scope.emailErrorVis = false;
	$scope.passwordErrorVis = false;
	$scope.nicknameErrorVis = false;
	$scope.emailChange = function() {
		$timeout.cancel(self.emailPromise);
		self.emailPromise = $timeout(function () {
			HttpService.checkField($scope,$scope.email,'../api/checkemail','email');
		},2000);
	};
	$scope.login = function() {
		HttpService.userLogin($scope.email,$scope.password);
		// console.log($scope, $q, $http, $location);
	};
	$scope.register = function() {
		HttpService.userRegistrate($scope,{
			email: $scope.email,
			password: $scope.password,
			mickname: $scope.nickname,
			firstName: $scope.firstName,
			lastName: $scope.lastName
		});
	};
})