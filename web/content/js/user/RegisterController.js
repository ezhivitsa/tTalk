app.controller('RegisterCtrl',['$scope', '$timeout', 'HttpService' ,function($scope, $timeout, HttpService) {
	var self = this;
	self.emailPromise = null;
	self.nicknamePromise = null;
	self.tmpEmail = null;
	self.tmpNickname = null;
	$scope.emailErrorVis = false;
	$scope.passwordErrorVis = false;
	$scope.nicknameErrorVis = false;
	$scope.rPasswordErrorVis = false;
	$scope.myPermisson = true;

	$scope.emailChange = function() {
		$timeout.cancel(self.emailPromise);
		self.tmpEmail = $scope.regData.email;
		self.emailPromise = $timeout(function () {
			if ($scope.regForm.email.$valid) {
				HttpService.checkField($scope,self.tmpEmail,'../api/checkemail','email');
			}
		},2000);
	};

	$scope.nicknameChange = function() {
		$timeout.cancel(self.nicknamePromise);
		self.tmpNickname = $scope.regData.nickname;
		self.nicknamePromise = $timeout(function () {
			if ($scope.regForm.nickname.$valid) {
				HttpService.checkField($scope,self.tmpNickname,'../api/checknickname','nickname');
			}
		},2000);
	};
	
	$scope.register = function() {
		$timeout.cancel(self.emailPromise);
		$timeout.cancel(self.nicknamePromise);
		HttpService.userRegistrate($scope);
	};

	$scope.passwordChange = function() {		
		if (!$scope.rPassword) {
			return;
		} else if ($scope.rPassword != $scope.regData.password) {
			$scope.passwordErrorVis = true;
			$scope.myPermisson = true;
		} else {
			$scope.passwordErrorVis = false;
			$scope.rPasswordErrorVis = false;
			$scope.myPermisson = false;
		}
	}

	$scope.rPasswordChange = function() {
		if (!$scope.regData.password) {
			return;
		} else if ($scope.rPassword != $scope.regData.password) {
			$scope.rPasswordErrorVis = true;
			$scope.myPermisson = true;
		} else {
			$scope.passwordErrorVis = false;
			$scope.rPasswordErrorVis = false;
			$scope.myPermisson = false;
		}
	}

	$timeout(function() {
		var inputs = document.querySelectorAll('input[ng-model]');
		for (var i = 0; i < inputs.length; i++) {
			angular.element(inputs[i]).checkAndTriggerAutoFillEvent();
		}
		$scope.regData = null;
	}, 500);
}]);