app.controller('LoginCtrl',function($scope,$timeout,HttpService) {
	var self = this;
	self.emailPromise = null;
	self.nicknamePromise = null;
	self.tmpEmail = null;
	self.tmpNickname = null;
	$scope.emailErrorVis = false;
	$scope.passwordErrorVis = false;
	$scope.nicknameErrorVis = false;
	$scope.emailChange = function() {
		$timeout.cancel(self.emailPromise);
		self.tmpEmail = $scope.email;
		self.emailPromise = $timeout(function () {
			if ($scope.regForm.email.$valid) {
				HttpService.checkField($scope,self.tmpEmail,'../api/checkemail','email');
			}
		},2000);
	};
	$scope.nicknameChange = function() {
		$timeout.cancel(self.nicknamePromise);
		self.tmpNickname = $scope.nickname;
		self.nicknamePromise = $timeout(function () {
			if ($scope.regForm.nickname.$valid) {
				HttpService.checkField($scope,self.tmpNickname,'../api/checknickname','nickname');
			}
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