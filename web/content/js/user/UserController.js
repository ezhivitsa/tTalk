app.controller('UserProfileCtrl', ['$scope', '$resource', '$q', '$location', function ( $scope, $resource, $q, $location ){

	var userDataService = $resource('../api/myaccount'),
		saveUserDataService = $resource('../api/changeaccount');
	$scope.myPermisson = false;

	$scope.userData = userDataService.get();

	$scope.passwordChange = function() {
		if (!$scope.rPassword) {
			return;
		} else if ($scope.rPassword != $scope.userData.password) {
			if (!$scope.userData.password) {
				$scope.rPassword = "";
				$scope.passwordError = '';
				$scope.rPasswordError = '';
				$scope.myPermisson = false;
			} else {
				$scope.passwordError = 'Please enter the same value again.';
				$scope.myPermisson = true;
			}
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
			$scope.myPermisson = false;
		}
	}

	$scope.rPasswordChange = function() {
		if (!$scope.userData.password) {
			return;
		} else if ($scope.rPassword != $scope.userData.password) {
			$scope.rPasswordError = 'Please enter the same value again.';
			$scope.myPermisson = true;
		} else {
			$scope.passwordError = '';
			$scope.rPasswordError = '';
			$scope.myPermisson = false;
		}
	}

	$scope.updateProfile = function ( event ) {
		event.preventDefault();
		var defer = $q.defer();
		saveUserDataService.save({},$scope.userData,
			function ( response ) {
				defer.resolve();
				$location.path("/main");
			},
			function ( response ) {
				defer.reject({
					message: response.data.message,
					status: response.status
				});
			});
		return defer.promise;
	}
	
}]);

app.controller('UserInfoCtrl', ['$scope', '$resource', function ( $scope, $resource ){
	
}]);