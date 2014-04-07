app.controller('RegisterCtrl',['$scope', '$timeout', '$resource', '$rootScope', '$q', '$location', function( $scope, $timeout, $resource, $rootScope, $q, $location ) {
	var self = this,
		registerService = $resource('../api/:action',{
			action: '@action'
		});

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
			if ($scope.regForm.regEmail.$valid) {
				
				registerService.save({ action: 'checkemail' },{ email: self.tmpEmail },function(response) {
						$scope.emailError = "";
					},function(response) {
						$scope.emailError = response.data.message;
					});

			}
		},2000);
	};

	$scope.nicknameChange = function() {
		$timeout.cancel(self.nicknamePromise);
		self.tmpNickname = $scope.regData.nickname;
		self.nicknamePromise = $timeout(function () {
			if ($scope.regForm.regNickname.$valid) {

				registerService.save({ action: 'checknickname' },{ nickname: self.tmpNickname },function(response) {
						$scope.nicknameError = "";
					},function(response) {
						$scope.nicknameError = response.data.message;
					});
				
			}
		},2000);
	};
	
	$scope.register = function() {
		$timeout.cancel(self.emailPromise);
		$timeout.cancel(self.nicknamePromise);
		var defer = $q.defer();
		registerService.save({ action: 'registration' },$scope.regData,function(response) {
				localStorage.setItem("nickname", response.nickname);				
				if (response.firstName) {
					localStorage.setItem("full", response.firstName + " " + response.lastName);
				}
				localStorage.setItem('isPositiveRating',response.isPositiveRating);
				$rootScope.$broadcast('logged');				
				defer.resolve();
				$location.path("/main");
			},function(response) {
				if (response.status == "403") {
					$scope[response.data.field + "Error"] = response.data.message;
				} else {
					defer.reject({
						message : response.data.message,
						status: response.status
					});	
				}	
			});
		return defer.promise;
	};

	$scope.passwordChange = function() {		
		if (!$scope.rPassword) {
			return;
		} else if ($scope.rPassword != $scope.regData.password) {
			$scope.passwordError = 'Please enter the same value again.';
			$scope.myPermisson = true;
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
			$scope.myPermisson = false;
		}
	}

	$scope.rPasswordChange = function() {
		if (!$scope.regData.password) {
			return;
		} else if ($scope.rPassword != $scope.regData.password) {
			$scope.rPasswordError = 'Please enter the same value again.';
			$scope.myPermisson = true;
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
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